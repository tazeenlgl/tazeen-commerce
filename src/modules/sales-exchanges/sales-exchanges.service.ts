import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalesExchangeDto } from './dto/create-sales-exchange.dto';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class SalesExchangesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Same YY-YY financial-year convention as SALES-01/SALES-02. */
  computeFinancialYear(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
  }

  /**
   * EXC-{5-digit serial}-{FY}, allocated under its own advisory-lock key so
   * it never contends with SALES-01 invoice numbers or SALES-02 return
   * numbers, using the same proven "lock, read current max, compute next"
   * technique — no counter table, no unguarded COUNT(*)+1.
   */
  private async generateExchangeNo(tx: TxClient, date: Date): Promise<string> {
    const fy = this.computeFinancialYear(date);

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('sales_exchange_number'))`;

    const rows = await tx.$queryRaw<{ return_no: string }[]>`
      SELECT return_no FROM sales_returns
      WHERE return_no LIKE ${'EXC-%-' + fy}
      ORDER BY return_no DESC
      LIMIT 1
    `;

    let nextSerial = 1;
    if (rows.length > 0) {
      const match = rows[0].return_no.match(/^EXC-(\d{5})-\d{2}-\d{2}$/);
      if (match) {
        nextSerial = parseInt(match[1], 10) + 1;
      }
    }

    return `EXC-${String(nextSerial).padStart(5, '0')}-${fy}`;
  }

  private computeItemDiscount(
    gross: Prisma.Decimal,
    discountType: string | undefined,
    discountValue: number | undefined,
  ): Prisma.Decimal {
    if (!discountType || !discountValue) {
      return new Prisma.Decimal(0);
    }

    const value = new Prisma.Decimal(discountValue);
    const amount =
      discountType === 'percent' ? gross.mul(value).div(100) : value;

    return Prisma.Decimal.min(amount, gross).toDecimalPlaces(2);
  }

  async create(dto: CreateSalesExchangeDto) {
    return this.prisma.$transaction(async (tx) => {
      // Row-level lock on the original invoice — same double-processing
      // guard used by SALES-02 and purchase-invoice receive().
      await tx.$queryRaw`SELECT id FROM sales_invoices WHERE id = ${dto.original_invoice_id}::uuid FOR UPDATE`;

      const invoice = await tx.sales_invoices.findUnique({
        where: { id: dto.original_invoice_id },
        include: { sales_invoice_items: true },
      });

      if (!invoice) {
        throw new NotFoundException('Original sales invoice not found');
      }

      if (String(invoice.status) !== 'Completed') {
        throw new BadRequestException(
          `Cannot exchange against an invoice with status ${invoice.status}`,
        );
      }

      // ---- Leg 1: original items being returned (SALES-02 logic, reused) ----
      const invoiceItemMap = new Map(
        invoice.sales_invoice_items.map((item) => [item.id, item]),
      );

      const returnItemRows: Prisma.sales_return_itemsCreateManyInput[] = [];
      let originalValue = new Prisma.Decimal(0);
      const restocks: { sku_id: string; quantity: number }[] = [];

      for (const requested of dto.original_items) {
        const invoiceItem = invoiceItemMap.get(requested.original_invoice_item_id);

        if (!invoiceItem) {
          throw new NotFoundException(
            `Invoice item ${requested.original_invoice_item_id} does not belong to this invoice`,
          );
        }

        const alreadyReturned = await tx.$queryRaw<{ total: string | null }[]>`
          SELECT COALESCE(SUM(sri.quantity), 0)::text AS total
          FROM sales_return_items sri
          JOIN sales_returns sr ON sr.id = sri.sales_return_id
          WHERE sri.original_invoice_item_id = ${requested.original_invoice_item_id}::uuid
            AND sr.status <> 'Cancelled'
        `;
        const returnedSoFar = parseInt(alreadyReturned[0]?.total ?? '0', 10);
        const remaining = invoiceItem.quantity - returnedSoFar;

        if (requested.quantity > remaining) {
          throw new ConflictException(
            `Return quantity ${requested.quantity} exceeds remaining returnable quantity ${remaining} for this invoice line`,
          );
        }

        // Original leg is priced from the invoice's own stored historical
        // value — never re-priced from current product/SKU data.
        const unitValue = new Prisma.Decimal(invoiceItem.total_value)
          .div(invoiceItem.quantity)
          .toDecimalPlaces(2);
        const totalValue = unitValue.mul(requested.quantity);

        originalValue = originalValue.plus(totalValue);

        returnItemRows.push({
          sales_return_id: '',
          original_invoice_item_id: invoiceItem.id,
          product_id: invoiceItem.product_id,
          sku_id: invoiceItem.sku_id,
          quantity: requested.quantity,
          unit_value: unitValue,
          total_value: totalValue,
        });

        restocks.push({ sku_id: invoiceItem.sku_id, quantity: requested.quantity });
      }

      // ---- Leg 2: replacement items (SALES-01 pricing logic, reused) ----
      const replacementSkuIds = [
        ...new Set(dto.replacement_items.map((item) => item.sku_id)),
      ];

      const replacementSkus = await tx.product_skus.findMany({
        where: { id: { in: replacementSkuIds } },
        select: {
          id: true,
          sku: true,
          product_id: true,
          mrp: true,
          status: true,
          products: {
            select: { id: true, product_name: true, status: true, gst_rate: true },
          },
        },
      });

      const replacementSkuMap = new Map(replacementSkus.map((sku) => [sku.id, sku]));

      if (replacementSkus.length !== replacementSkuIds.length) {
        const missing = replacementSkuIds.filter((id) => !replacementSkuMap.has(id));
        throw new NotFoundException(`Replacement SKU not found: ${missing.join(', ')}`);
      }

      const replacementItemRows: Prisma.exchange_replacement_itemsCreateManyInput[] = [];
      let replacementValue = new Prisma.Decimal(0);
      const decrements: { sku_id: string; quantity: number }[] = [];

      for (const requested of dto.replacement_items) {
        const sku = replacementSkuMap.get(requested.sku_id)!;

        if (String(sku.status) !== 'Active') {
          throw new BadRequestException(`SKU ${sku.sku} is inactive`);
        }
        if (String(sku.products.status) !== 'Active') {
          throw new BadRequestException(
            `Product ${sku.products.product_name} is inactive`,
          );
        }

        // Replacement leg is priced from current authoritative product/SKU
        // data — never trusted from the client, and never adjusted to
        // match the original leg's GST rate.
        const mrp = new Prisma.Decimal(sku.mrp);
        const gross = mrp.mul(requested.quantity);
        const discountAmount = this.computeItemDiscount(
          gross,
          requested.discount_type,
          requested.discount_value,
        );
        const netValue = gross.minus(discountAmount);

        replacementValue = replacementValue.plus(netValue);

        replacementItemRows.push({
          sales_return_id: '',
          product_id: sku.product_id,
          sku_id: sku.id,
          quantity: requested.quantity,
          mrp,
          discount_amount: discountAmount,
          net_value: netValue,
        });

        decrements.push({ sku_id: sku.id, quantity: requested.quantity });
      }

      const exchangeId = crypto.randomUUID();

      // ---- Stock mutations: restock returned SKUs, decrement replacements ----
      for (const restock of restocks) {
        const rows = await tx.$queryRaw<{ quantity: number }[]>`
          UPDATE inventory_stock
          SET quantity = quantity + ${restock.quantity}, updated_at = now()
          WHERE sku_id = ${restock.sku_id}::uuid AND location_id = ${invoice.location_id}::uuid
          RETURNING quantity
        `;

        if (rows.length === 0) {
          throw new ConflictException(
            `No inventory stock row exists for SKU ${restock.sku_id} at this location`,
          );
        }

        const quantityAfter = rows[0].quantity;
        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: restock.sku_id,
            location_id: invoice.location_id,
            movement_type: 'Customer_Return',
            quantity_change: restock.quantity,
            quantity_before: quantityAfter - restock.quantity,
            quantity_after: quantityAfter,
            reference_type: 'sales_exchange',
            reference_id: exchangeId,
          },
        });
      }

      for (const decrement of decrements) {
        const rows = await tx.$queryRaw<{ quantity: number }[]>`
          UPDATE inventory_stock
          SET quantity = quantity - ${decrement.quantity}, updated_at = now()
          WHERE sku_id = ${decrement.sku_id}::uuid AND location_id = ${invoice.location_id}::uuid
            AND quantity - ${decrement.quantity} >= 0
          RETURNING quantity
        `;

        if (rows.length === 0) {
          throw new ConflictException(
            `Insufficient stock for replacement SKU ${replacementSkuMap.get(decrement.sku_id)!.sku}`,
          );
        }

        const quantityAfter = rows[0].quantity;
        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: decrement.sku_id,
            location_id: invoice.location_id,
            movement_type: 'Sale',
            quantity_change: -decrement.quantity,
            quantity_before: quantityAfter + decrement.quantity,
            quantity_after: quantityAfter,
            reference_type: 'sales_exchange',
            reference_id: exchangeId,
          },
        });
      }

      // ---- Settlement: positive = customer pays, negative = customer is refunded ----
      const settlementAmount = replacementValue.minus(originalValue).toDecimalPlaces(2);

      if (!settlementAmount.isZero() && !dto.settlement_method) {
        throw new BadRequestException(
          'settlement_method is required when the exchange has a non-zero price difference',
        );
      }

      if (dto.settlement_method === 'Wallet' && !invoice.customer_id) {
        throw new BadRequestException(
          'Wallet settlement requires the original sale to be linked to a customer',
        );
      }

      const exchangeDate = new Date();
      const exchangeNo = await this.generateExchangeNo(tx, exchangeDate);

      const salesReturn = await tx.sales_returns.create({
        data: {
          id: exchangeId,
          return_no: exchangeNo,
          original_invoice_id: invoice.id,
          customer_id: invoice.customer_id,
          location_id: invoice.location_id,
          return_type: 'Exchange',
          return_date: exchangeDate,
          reason: dto.reason,
          reason_note: dto.reason_note ?? null,
          status: 'Completed',
          original_value: originalValue.toDecimalPlaces(2),
          replacement_value: replacementValue.toDecimalPlaces(2),
          settlement_amount: settlementAmount,
          updated_at: exchangeDate,
        },
      });

      await tx.sales_return_items.createMany({
        data: returnItemRows.map((row) => ({ ...row, sales_return_id: salesReturn.id })),
      });

      await tx.exchange_replacement_items.createMany({
        data: replacementItemRows.map((row) => ({ ...row, sales_return_id: salesReturn.id })),
      });

      await tx.sales_return_settlements.create({
        data: {
          sales_return_id: salesReturn.id,
          settlement_type: settlementAmount.isZero() ? 'None' : dto.settlement_method!,
          amount: settlementAmount.abs(),
          reference_type: 'sales_exchange',
          reference_id: salesReturn.id,
        },
      });

      if (!settlementAmount.isZero() && dto.settlement_method === 'Wallet') {
        // Positive settlementAmount → customer owes → debit the wallet, with
        // the same guarded (balance + delta >= 0) UPDATE as SALES-01's
        // wallet payment path: an insufficient balance hard-fails and rolls
        // back the entire exchange, per spec — no partial/mixed settlement.
        // Negative settlementAmount → customer is refunded → credit the
        // wallet using the same atomic pattern as SALES-02.
        const delta = settlementAmount.isPositive()
          ? settlementAmount.negated()
          : settlementAmount.abs();

        const walletRows = await tx.$queryRaw<
          { id: string; balance: Prisma.Decimal }[]
        >`
          UPDATE customer_wallets
          SET balance = balance + ${delta}, updated_at = now()
          WHERE customer_id = ${invoice.customer_id}::uuid AND balance + ${delta} >= 0
          RETURNING id, balance
        `;

        if (walletRows.length === 0) {
          throw new ConflictException(
            settlementAmount.isPositive()
              ? 'Wallet balance cannot become negative'
              : 'Wallet not found for this customer',
          );
        }

        const { id: walletId, balance: balanceAfter } = walletRows[0];
        const balanceBefore = balanceAfter.minus(delta);

        await tx.customer_wallet_transactions.create({
          data: {
            wallet_id: walletId,
            transaction_type: settlementAmount.isPositive() ? 'Manual_Debit' : 'Manual_Credit',
            reference_type: 'sales_exchange',
            reference_id: salesReturn.id,
            amount: delta.abs(),
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            reason: `Exchange ${salesReturn.return_no}`,
          },
        });
      }

      return tx.sales_returns.findUnique({
        where: { id: salesReturn.id },
        include: {
          sales_return_items: true,
          exchange_replacement_items: true,
          sales_return_settlements: true,
        },
      });
    });
  }

  async findOne(id: string) {
    const exchange = await this.prisma.sales_returns.findUnique({
      where: { id },
      include: {
        sales_return_items: true,
        exchange_replacement_items: true,
        sales_return_settlements: true,
      },
    });

    if (!exchange || String(exchange.return_type) !== 'Exchange') {
      throw new NotFoundException('Sales exchange not found');
    }

    return exchange;
  }

  async findAll(params: { customerId?: string; page?: number; limit?: number }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where: Prisma.sales_returnsWhereInput = {
      return_type: 'Exchange',
      ...(params.customerId ? { customer_id: params.customerId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sales_returns.findMany({
        where,
        orderBy: [{ return_date: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sales_returns.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }
}
