import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalesReturnDto } from './dto/create-sales-return.dto';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class SalesReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Same YY-YY financial-year convention as SALES-01 invoice numbering. */
  computeFinancialYear(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
  }

  /**
   * RET-{5-digit serial}-{FY}, serialized the same way as SALES-01's
   * TAZ-{serial}-{FY} invoice numbers: an advisory transaction lock (its own
   * key, so it never contends with invoice-number allocation) makes the
   * "read current max, compute next" step safe under concurrency without a
   * counter table or an unguarded COUNT(*)+1.
   */
  private async generateReturnNo(tx: TxClient, date: Date): Promise<string> {
    const fy = this.computeFinancialYear(date);

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('sales_return_number'))`;

    const rows = await tx.$queryRaw<{ return_no: string }[]>`
      SELECT return_no FROM sales_returns
      WHERE return_no LIKE ${'RET-%-' + fy}
      ORDER BY return_no DESC
      LIMIT 1
    `;

    let nextSerial = 1;
    if (rows.length > 0) {
      const match = rows[0].return_no.match(/^RET-(\d{5})-\d{2}-\d{2}$/);
      if (match) {
        nextSerial = parseInt(match[1], 10) + 1;
      }
    }

    return `RET-${String(nextSerial).padStart(5, '0')}-${fy}`;
  }

  async create(dto: CreateSalesReturnDto) {
    return this.prisma.$transaction(async (tx) => {
      // Row-level lock on the original invoice: prevents a second concurrent
      // return on the same invoice from reading the same "already returned"
      // totals before this one commits, closing the same race window that
      // purchase-invoice receive() closes for double-processing.
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
          `Cannot return against an invoice with status ${invoice.status}`,
        );
      }

      if (dto.settlement_method === 'Wallet' && !invoice.customer_id) {
        throw new BadRequestException(
          'Wallet settlement requires the original sale to be linked to a customer',
        );
      }

      const invoiceItemMap = new Map(
        invoice.sales_invoice_items.map((item) => [item.id, item]),
      );

      const returnItemRows: Prisma.sales_return_itemsCreateManyInput[] = [];
      let originalValue = new Prisma.Decimal(0);
      const stockRestocks: { sku_id: string; quantity: number }[] = [];

      for (const requested of dto.items) {
        const invoiceItem = invoiceItemMap.get(requested.original_invoice_item_id);

        if (!invoiceItem) {
          throw new NotFoundException(
            `Invoice item ${requested.original_invoice_item_id} does not belong to this invoice`,
          );
        }

        // Cumulative-return guard: sum every non-cancelled return already
        // recorded against this invoice line, so repeated partial returns
        // can never exceed the quantity that was actually sold.
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

        // unit_value/total_value are derived from the original invoice
        // line's authoritative total_value — never re-priced from current
        // product/SKU data, since a return settles what was actually paid.
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

        stockRestocks.push({ sku_id: invoiceItem.sku_id, quantity: requested.quantity });
      }

      const returnId = crypto.randomUUID();

      // Restock: atomic guarded UPDATE (same technique as SALES-01/
      // purchase-invoice receive), positive delta this time — no negative
      // guard is needed for a credit, but the single-statement UPDATE still
      // takes Postgres's own row lock, so concurrent returns on the same
      // SKU/location can never lose one of the increments.
      for (const restock of stockRestocks) {
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
        const quantityBefore = quantityAfter - restock.quantity;

        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: restock.sku_id,
            location_id: invoice.location_id,
            movement_type: 'Customer_Return',
            quantity_change: restock.quantity,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            reference_type: 'sales_return',
            reference_id: returnId,
          },
        });
      }

      const returnDate = new Date();
      const returnNo = await this.generateReturnNo(tx, returnDate);
      const settlementAmount = originalValue.toDecimalPlaces(2);

      const salesReturn = await tx.sales_returns.create({
        data: {
          id: returnId,
          return_no: returnNo,
          original_invoice_id: invoice.id,
          customer_id: invoice.customer_id,
          location_id: invoice.location_id,
          return_type: 'Return',
          return_date: returnDate,
          reason: dto.reason,
          reason_note: dto.reason_note ?? null,
          status: 'Completed',
          original_value: originalValue.toDecimalPlaces(2),
          replacement_value: new Prisma.Decimal(0),
          settlement_amount: settlementAmount,
          updated_at: returnDate,
        },
      });

      await tx.sales_return_items.createMany({
        data: returnItemRows.map((row) => ({
          ...row,
          sales_return_id: salesReturn.id,
        })),
      });

      await tx.sales_return_settlements.create({
        data: {
          sales_return_id: salesReturn.id,
          settlement_type: dto.settlement_method,
          amount: settlementAmount,
          reference_type: 'sales_return',
          reference_id: salesReturn.id,
        },
      });

      if (dto.settlement_method === 'Wallet' && !settlementAmount.isZero()) {
        // Same atomic guarded-balance-UPDATE pattern as WalletService and
        // SALES-01's wallet debit path — a credit, so no negative-balance
        // guard is needed, but the single-statement UPDATE still serializes
        // concurrent wallet mutations on the same customer.
        const walletRows = await tx.$queryRaw<
          { id: string; balance: Prisma.Decimal }[]
        >`
          UPDATE customer_wallets
          SET balance = balance + ${settlementAmount}, updated_at = now()
          WHERE customer_id = ${invoice.customer_id}::uuid
          RETURNING id, balance
        `;

        if (walletRows.length === 0) {
          throw new NotFoundException('Wallet not found for this customer');
        }

        const { id: walletId, balance: balanceAfter } = walletRows[0];
        const balanceBefore = balanceAfter.minus(settlementAmount);

        await tx.customer_wallet_transactions.create({
          data: {
            wallet_id: walletId,
            transaction_type: 'Manual_Credit',
            reference_type: 'sales_return',
            reference_id: salesReturn.id,
            amount: settlementAmount,
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            reason: `Return ${salesReturn.return_no}`,
          },
        });
      }

      return tx.sales_returns.findUnique({
        where: { id: salesReturn.id },
        include: {
          sales_return_items: true,
          sales_return_settlements: true,
        },
      });
    });
  }

  async findOne(id: string) {
    const salesReturn = await this.prisma.sales_returns.findUnique({
      where: { id },
      include: {
        sales_return_items: true,
        sales_return_settlements: true,
      },
    });

    if (!salesReturn) {
      throw new NotFoundException('Sales return not found');
    }

    return salesReturn;
  }

  async findAll(params: { customerId?: string; page?: number; limit?: number }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where: Prisma.sales_returnsWhereInput = {
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
