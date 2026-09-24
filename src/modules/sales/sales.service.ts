import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

type TxClient = Prisma.TransactionClient;

interface ItemCalculation {
  sku_id: string;
  product_id: string;
  quantity: number;
  mrp: Prisma.Decimal;
  gst_rate: Prisma.Decimal;
  discount_type: string | null;
  discount_value: Prisma.Decimal;
  gross: Prisma.Decimal;
  item_discount_amount: Prisma.Decimal;
  net_after_item_discount: Prisma.Decimal;
}

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Financial year runs 1 April - 31 March, formatted YY-YY (e.g. 26-27).
   * Exposed as a pure function so tests can exercise FY-boundary behaviour
   * with controlled dates instead of relying on real server time.
   */
  computeFinancialYear(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
  }

  /**
   * Allocates a sequential, gap-tolerant invoice number for the given
   * financial year: TAZ-{5-digit serial}-{FY}. An advisory transaction lock
   * (released automatically at commit/rollback) serializes every concurrent
   * caller through the "read current max, compute next" critical section, so
   * this is safe under concurrency without a dedicated counter table and
   * without the unsafe COUNT(*)+1 pattern (which would double-allocate the
   * same serial to two concurrent transactions). The invoice_no UNIQUE
   * constraint remains a defense-in-depth backstop.
   */
  private async generateInvoiceNo(
    tx: TxClient,
    invoiceDate: Date,
  ): Promise<string> {
    const fy = this.computeFinancialYear(invoiceDate);

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('sales_invoice_number'))`;

    const rows = await tx.$queryRaw<{ invoice_no: string }[]>`
      SELECT invoice_no FROM sales_invoices
      WHERE invoice_no LIKE ${'TAZ-%-' + fy}
      ORDER BY invoice_no DESC
      LIMIT 1
    `;

    let nextSerial = 1;

    if (rows.length > 0) {
      const match = rows[0].invoice_no.match(/^TAZ-(\d{5})-\d{2}-\d{2}$/);
      if (match) {
        nextSerial = parseInt(match[1], 10) + 1;
      }
    }

    return `TAZ-${String(nextSerial).padStart(5, '0')}-${fy}`;
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

    // Discount can never exceed the line's own gross value.
    return Prisma.Decimal.min(amount, gross).toDecimalPlaces(2);
  }

  async create(dto: CreateSaleDto) {
    const locationId = dto.location_id.trim();

    return this.prisma.$transaction(async (tx) => {
      const location = await tx.locations.findUnique({
        where: { id: locationId },
        select: { id: true, status: true },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }

      if (String(location.status) !== 'Active') {
        throw new BadRequestException('Location is inactive');
      }

      let customerId: string | undefined;

      if (dto.customer_id) {
        const customer = await tx.customers.findUnique({
          where: { id: dto.customer_id.trim() },
          select: { id: true, status: true },
        });

        if (!customer) {
          throw new NotFoundException('Customer not found');
        }

        if (String(customer.status) !== 'Active') {
          throw new BadRequestException('Customer is inactive');
        }

        customerId = customer.id;
      }

      const skuIds = [...new Set(dto.items.map((item) => item.sku_id))];

      const skus = await tx.product_skus.findMany({
        where: { id: { in: skuIds } },
        select: {
          id: true,
          sku: true,
          product_id: true,
          mrp: true,
          status: true,
          products: {
            select: {
              id: true,
              product_name: true,
              status: true,
              gst_rate: true,
            },
          },
        },
      });

      const skuMap = new Map(skus.map((sku) => [sku.id, sku]));

      if (skus.length !== skuIds.length) {
        const missing = skuIds.filter((id) => !skuMap.has(id));
        throw new NotFoundException(`SKU not found: ${missing.join(', ')}`);
      }

      const calculations: ItemCalculation[] = dto.items.map((item) => {
        const sku = skuMap.get(item.sku_id)!;

        if (String(sku.status) !== 'Active') {
          throw new BadRequestException(`SKU ${sku.sku} is inactive`);
        }

        if (String(sku.products.status) !== 'Active') {
          throw new BadRequestException(
            `Product ${sku.products.product_name} is inactive`,
          );
        }

        // MRP and GST rate are authoritative from product/SKU records —
        // never trusted from the client request.
        const mrp = new Prisma.Decimal(sku.mrp);
        const gstRate = new Prisma.Decimal(sku.products.gst_rate);
        const gross = mrp.mul(item.quantity);

        const itemDiscountAmount = this.computeItemDiscount(
          gross,
          item.discount_type,
          item.discount_value,
        );

        return {
          sku_id: sku.id,
          product_id: sku.product_id,
          quantity: item.quantity,
          mrp,
          gst_rate: gstRate,
          discount_type: item.discount_type ?? null,
          discount_value: new Prisma.Decimal(item.discount_value ?? 0),
          gross,
          item_discount_amount: itemDiscountAmount,
          net_after_item_discount: gross.minus(itemDiscountAmount),
        };
      });

      const subtotal = calculations.reduce(
        (sum, c) => sum.plus(c.gross),
        new Prisma.Decimal(0),
      );
      const itemDiscountTotal = calculations.reduce(
        (sum, c) => sum.plus(c.item_discount_amount),
        new Prisma.Decimal(0),
      );
      const subtotalAfterItemDiscount = calculations.reduce(
        (sum, c) => sum.plus(c.net_after_item_discount),
        new Prisma.Decimal(0),
      );

      const requestedBillDiscount = new Prisma.Decimal(dto.bill_discount ?? 0);
      const billDiscount = Prisma.Decimal.min(
        requestedBillDiscount,
        subtotalAfterItemDiscount,
      ).toDecimalPlaces(2);

      // Proportional allocation of the bill-level discount across items,
      // deterministic monetary rounding to 2dp, remainder assigned to the
      // last item so the sum of shares reconciles exactly to billDiscount.
      let allocatedSoFar = new Prisma.Decimal(0);
      const billShares: Prisma.Decimal[] = calculations.map((c, index) => {
        if (billDiscount.isZero() || subtotalAfterItemDiscount.isZero()) {
          return new Prisma.Decimal(0);
        }

        if (index === calculations.length - 1) {
          return billDiscount.minus(allocatedSoFar);
        }

        const share = billDiscount
          .mul(c.net_after_item_discount)
          .div(subtotalAfterItemDiscount)
          .toDecimalPlaces(2);
        allocatedSoFar = allocatedSoFar.plus(share);
        return share;
      });

      let taxableValue = new Prisma.Decimal(0);
      let gstAmount = new Prisma.Decimal(0);
      let cgstAmount = new Prisma.Decimal(0);
      let sgstAmount = new Prisma.Decimal(0);
      const igstAmount = new Prisma.Decimal(0);
      let finalPayable = new Prisma.Decimal(0);

      const itemRows: Prisma.sales_invoice_itemsCreateManyInput[] = [];

      calculations.forEach((c, index) => {
        const billShare = billShares[index];
        const totalDiscountAmount = c.item_discount_amount.plus(billShare);
        const netValue = c.net_after_item_discount.minus(billShare);

        // MRP is GST-inclusive; back out the taxable value.
        const divisor = new Prisma.Decimal(1).plus(c.gst_rate.div(100));
        const taxable = netValue.div(divisor).toDecimalPlaces(2);
        const gst = netValue.minus(taxable);

        // No inter-state distinction is modelled for retail POS sales;
        // default to intra-state CGST/SGST split (IGST reserved at 0),
        // mirroring the purchase-invoice default tax posture.
        const cgst = gst.div(2).toDecimalPlaces(2);
        const sgst = gst.minus(cgst);

        taxableValue = taxableValue.plus(taxable);
        gstAmount = gstAmount.plus(gst);
        cgstAmount = cgstAmount.plus(cgst);
        sgstAmount = sgstAmount.plus(sgst);
        finalPayable = finalPayable.plus(netValue);

        itemRows.push({
          sales_invoice_id: '',
          product_id: c.product_id,
          sku_id: c.sku_id,
          quantity: c.quantity,
          mrp: c.mrp,
          discount_type: c.discount_type,
          discount_value: c.discount_value,
          discount_amount: totalDiscountAmount.toDecimalPlaces(2),
          net_value: c.net_after_item_discount.toDecimalPlaces(2),
          gst_rate: c.gst_rate,
          taxable_value: taxable,
          cgst_amount: cgst,
          sgst_amount: sgst,
          igst_amount: new Prisma.Decimal(0),
          gst_amount: gst,
          total_value: netValue.toDecimalPlaces(2),
        });
      });

      if (!Array.isArray(dto.payments) || dto.payments.length === 0) {
        throw new BadRequestException('At least one payment is required');
      }

      const paymentsTotal = dto.payments.reduce(
        (sum, p) => sum.plus(new Prisma.Decimal(p.amount)),
        new Prisma.Decimal(0),
      );

      if (!paymentsTotal.equals(finalPayable.toDecimalPlaces(2))) {
        throw new BadRequestException(
          `Payments total ${paymentsTotal.toFixed(2)} does not match payable amount ${finalPayable.toDecimalPlaces(2).toFixed(2)}`,
        );
      }

      const walletPayments = dto.payments.filter(
        (p) => p.payment_method === 'Wallet',
      );

      if (walletPayments.length > 0 && !customerId) {
        throw new BadRequestException(
          'Wallet payment requires a customer to be linked to the sale',
        );
      }

      const invoiceId = crypto.randomUUID();

      // Stock deduction: one atomic guarded UPDATE per item, identical
      // pattern to the proven purchase-invoice / inventory-adjustment
      // technique — negative delta with a WHERE guard against negative
      // stock, so the check and the write are a single indivisible step.
      for (const c of calculations) {
        const rows = await tx.$queryRaw<
          { quantity: number }[]
        >`
          UPDATE inventory_stock
          SET quantity = quantity - ${c.quantity}, updated_at = now()
          WHERE sku_id = ${c.sku_id}::uuid AND location_id = ${locationId}::uuid
            AND quantity - ${c.quantity} >= 0
          RETURNING quantity
        `;

        if (rows.length === 0) {
          throw new ConflictException(
            `Insufficient stock for SKU ${skuMap.get(c.sku_id)!.sku}`,
          );
        }

        const quantityAfter = rows[0].quantity;
        const quantityBefore = quantityAfter + c.quantity;

        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: c.sku_id,
            location_id: locationId,
            movement_type: 'Sale',
            quantity_change: -c.quantity,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            reference_type: 'sales_invoice',
            reference_id: invoiceId,
          },
        });
      }

      const invoiceDate = new Date();
      const invoiceNo = await this.generateInvoiceNo(tx, invoiceDate);

      const invoice = await tx.sales_invoices.create({
        data: {
          id: invoiceId,
          invoice_no: invoiceNo,
          customer_id: customerId ?? null,
          location_id: locationId,
          invoice_date: invoiceDate,
          subtotal: subtotal.toDecimalPlaces(2),
          item_discount: itemDiscountTotal.toDecimalPlaces(2),
          bill_discount: billDiscount,
          taxable_value: taxableValue.toDecimalPlaces(2),
          cgst_amount: cgstAmount.toDecimalPlaces(2),
          sgst_amount: sgstAmount.toDecimalPlaces(2),
          igst_amount: igstAmount,
          gst_amount: gstAmount.toDecimalPlaces(2),
          final_payable: finalPayable.toDecimalPlaces(2),
          status: 'Completed',
          updated_at: invoiceDate,
        },
      });

      await tx.sales_invoice_items.createMany({
        data: itemRows.map((row) => ({
          ...row,
          sales_invoice_id: invoice.id,
        })),
      });

      for (const payment of dto.payments) {
        await tx.sales_invoice_payments.create({
          data: {
            sales_invoice_id: invoice.id,
            payment_method: payment.payment_method,
            amount: new Prisma.Decimal(payment.amount),
            payment_reference: payment.payment_reference ?? null,
          },
        });

        if (payment.payment_method === 'Wallet') {
          const delta = new Prisma.Decimal(payment.amount).negated();

          const walletRows = await tx.$queryRaw<
            { id: string; balance: Prisma.Decimal }[]
          >`
            UPDATE customer_wallets
            SET balance = balance + ${delta}, updated_at = now()
            WHERE customer_id = ${customerId}::uuid AND balance + ${delta} >= 0
            RETURNING id, balance
          `;

          if (walletRows.length === 0) {
            throw new ConflictException(
              'Wallet balance cannot become negative',
            );
          }

          const { id: walletId, balance: balanceAfter } = walletRows[0];
          const balanceBefore = balanceAfter.minus(delta);

          await tx.customer_wallet_transactions.create({
            data: {
              wallet_id: walletId,
              transaction_type: 'Manual_Debit',
              reference_type: 'sales_invoice',
              reference_id: invoice.id,
              amount: delta.abs(),
              balance_before: balanceBefore,
              balance_after: balanceAfter,
              reason: `Sale ${invoice.invoice_no}`,
            },
          });
        }
      }

      return tx.sales_invoices.findUnique({
        where: { id: invoice.id },
        include: {
          sales_invoice_items: true,
          sales_invoice_payments: true,
        },
      });
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.sales_invoices.findUnique({
      where: { id },
      include: {
        sales_invoice_items: true,
        sales_invoice_payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Sales invoice not found');
    }

    return invoice;
  }

  async findAll(params: { customerId?: string; page?: number; limit?: number }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where: Prisma.sales_invoicesWhereInput = {
      ...(params.customerId ? { customer_id: params.customerId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sales_invoices.findMany({
        where,
        orderBy: [{ invoice_date: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sales_invoices.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }
}
