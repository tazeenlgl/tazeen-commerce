import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class PurchaseReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Same YY-YY financial-year convention as SALES-01/02/03. */
  computeFinancialYear(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
  }

  /**
   * PRET-{5-digit serial}-{FY}, allocated under its own advisory-lock key
   * (independent of SALES-01/02/03's and SUPPLIER-01's keys) using the same
   * "lock, read current max, compute next" technique — no counter table,
   * no unguarded COUNT(*)+1.
   */
  private async generateReturnNo(tx: TxClient, date: Date): Promise<string> {
    const fy = this.computeFinancialYear(date);

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('purchase_return_number'))`;

    const rows = await tx.$queryRaw<{ return_no: string }[]>`
      SELECT return_no FROM purchase_returns
      WHERE return_no LIKE ${'PRET-%-' + fy}
      ORDER BY return_no DESC
      LIMIT 1
    `;

    let nextSerial = 1;
    if (rows.length > 0) {
      const match = rows[0].return_no.match(/^PRET-(\d{5})-\d{2}-\d{2}$/);
      if (match) {
        nextSerial = parseInt(match[1], 10) + 1;
      }
    }

    return `PRET-${String(nextSerial).padStart(5, '0')}-${fy}`;
  }

  async create(dto: CreatePurchaseReturnDto) {
    return this.prisma.$transaction(async (tx) => {
      // Row-level lock on the original purchase invoice — same
      // double-processing guard used by purchase-invoice receive() and
      // SALES-02/03's return/exchange creation.
      await tx.$queryRaw`SELECT id FROM purchase_invoices WHERE id = ${dto.purchase_invoice_id}::uuid FOR UPDATE`;

      const invoice = await tx.purchase_invoices.findUnique({
        where: { id: dto.purchase_invoice_id },
        include: { purchase_invoice_items: true },
      });

      if (!invoice) {
        throw new NotFoundException('Purchase invoice not found');
      }

      if (String(invoice.status) !== 'Received') {
        throw new BadRequestException(
          `Cannot return against a purchase invoice with status ${invoice.status}`,
        );
      }

      const supplier = await tx.supplier.findUnique({
        where: { id: invoice.supplier_id },
        select: { id: true, status: true },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }

      if (String(supplier.status) !== 'ACTIVE') {
        throw new BadRequestException('Supplier is inactive');
      }

      // purchase_invoices.location is a plain warehouse-name string, not a
      // location_id FK — resolve it the same way receive() does.
      const locations = await tx.locations.findMany({
        where: {
          location_name: invoice.location,
          location_type: 'Warehouse',
          status: 'Active',
        },
        select: { id: true },
      });

      if (locations.length === 0) {
        throw new ConflictException(
          'Purchase invoice warehouse is not active or no longer exists',
        );
      }
      if (locations.length > 1) {
        throw new ConflictException('Purchase invoice warehouse is ambiguous');
      }
      const locationId = locations[0].id;

      const invoiceItemMap = new Map(
        invoice.purchase_invoice_items.map((item) => [item.id, item]),
      );

      const returnItemRows: Prisma.purchase_return_itemsCreateManyInput[] = [];
      let taxableValue = new Prisma.Decimal(0);
      let cgstAmount = new Prisma.Decimal(0);
      let sgstAmount = new Prisma.Decimal(0);
      let igstAmount = new Prisma.Decimal(0);
      let gstAmount = new Prisma.Decimal(0);
      let totalValue = new Prisma.Decimal(0);
      const decrements: { sku_id: string; quantity: number }[] = [];

      for (const requested of dto.items) {
        const invoiceItem = invoiceItemMap.get(requested.original_invoice_item_id);

        if (!invoiceItem) {
          throw new NotFoundException(
            `Invoice item ${requested.original_invoice_item_id} does not belong to this invoice`,
          );
        }

        // Cumulative-return guard: sum every non-cancelled return already
        // recorded against this invoice line, so repeated partial returns
        // can never exceed the quantity that was actually received.
        const alreadyReturned = await tx.$queryRaw<{ total: string | null }[]>`
          SELECT COALESCE(SUM(pri.quantity), 0)::text AS total
          FROM purchase_return_items pri
          JOIN purchase_returns pr ON pr.id = pri.purchase_return_id
          WHERE pri.original_invoice_item_id = ${requested.original_invoice_item_id}::uuid
            AND pr.status <> 'Cancelled'
        `;
        const returnedSoFar = parseInt(alreadyReturned[0]?.total ?? '0', 10);
        const remaining = invoiceItem.quantity - returnedSoFar;

        if (requested.quantity > remaining) {
          throw new ConflictException(
            `Return quantity ${requested.quantity} exceeds remaining returnable quantity ${remaining} for this invoice line`,
          );
        }

        // Priced strictly from the original invoice line's authoritative
        // historical values, prorated by the fraction being returned —
        // never re-priced from current product/SKU data.
        const ratio = new Prisma.Decimal(requested.quantity).div(invoiceItem.quantity);
        const lineTaxable = new Prisma.Decimal(invoiceItem.taxable_value).mul(ratio).toDecimalPlaces(2);
        const lineCgst = new Prisma.Decimal(invoiceItem.cgst_amount).mul(ratio).toDecimalPlaces(2);
        const lineSgst = new Prisma.Decimal(invoiceItem.sgst_amount).mul(ratio).toDecimalPlaces(2);
        const lineIgst = new Prisma.Decimal(invoiceItem.igst_amount).mul(ratio).toDecimalPlaces(2);
        const lineGst = new Prisma.Decimal(invoiceItem.gst_amount).mul(ratio).toDecimalPlaces(2);
        const lineTotal = new Prisma.Decimal(invoiceItem.total_value).mul(ratio).toDecimalPlaces(2);

        taxableValue = taxableValue.plus(lineTaxable);
        cgstAmount = cgstAmount.plus(lineCgst);
        sgstAmount = sgstAmount.plus(lineSgst);
        igstAmount = igstAmount.plus(lineIgst);
        gstAmount = gstAmount.plus(lineGst);
        totalValue = totalValue.plus(lineTotal);

        returnItemRows.push({
          purchase_return_id: '',
          original_invoice_item_id: invoiceItem.id,
          product_id: invoiceItem.product_id,
          sku_id: invoiceItem.sku_id,
          quantity: requested.quantity,
          purchase_rate: invoiceItem.purchase_rate,
          gst_rate: invoiceItem.gst_rate,
          taxable_value: lineTaxable,
          cgst_amount: lineCgst,
          sgst_amount: lineSgst,
          igst_amount: lineIgst,
          gst_amount: lineGst,
          total_value: lineTotal,
        });

        decrements.push({ sku_id: invoiceItem.sku_id, quantity: requested.quantity });
      }

      const returnId = crypto.randomUUID();

      // Stock reversal: goods are leaving inventory back to the supplier,
      // so this is a guarded negative-stock-protected decrement — the same
      // technique used everywhere else in this codebase for outgoing stock.
      for (const decrement of decrements) {
        const rows = await tx.$queryRaw<{ quantity: number }[]>`
          UPDATE inventory_stock
          SET quantity = quantity - ${decrement.quantity}, updated_at = now()
          WHERE sku_id = ${decrement.sku_id}::uuid AND location_id = ${locationId}::uuid
            AND quantity - ${decrement.quantity} >= 0
          RETURNING quantity
        `;

        if (rows.length === 0) {
          throw new ConflictException(
            `Stock cannot become negative for SKU ${decrement.sku_id}`,
          );
        }

        const quantityAfter = rows[0].quantity;
        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: decrement.sku_id,
            location_id: locationId,
            movement_type: 'Purchase_Return',
            quantity_change: -decrement.quantity,
            quantity_before: quantityAfter + decrement.quantity,
            quantity_after: quantityAfter,
            reference_type: 'purchase_return',
            reference_id: returnId,
          },
        });
      }

      const returnDate = new Date();
      const returnNo = await this.generateReturnNo(tx, returnDate);

      const purchaseReturn = await tx.purchase_returns.create({
        data: {
          id: returnId,
          return_no: returnNo,
          purchase_invoice_id: invoice.id,
          supplier_id: invoice.supplier_id,
          location_id: locationId,
          return_date: returnDate,
          reason: dto.reason,
          status: 'Completed',
          taxable_value: taxableValue,
          cgst_amount: cgstAmount,
          sgst_amount: sgstAmount,
          igst_amount: igstAmount,
          gst_amount: gstAmount,
          total_value: totalValue,
          updated_at: returnDate,
        },
      });

      await tx.purchase_return_items.createMany({
        data: returnItemRows.map((row) => ({ ...row, purchase_return_id: purchaseReturn.id })),
      });

      // Supplier credit note: invoice-level record of the credit owed to
      // us, posted immediately (no approval workflow in this task).
      await tx.supplier_credit_notes.create({
        data: {
          supplier_id: invoice.supplier_id,
          purchase_invoice_id: invoice.id,
          amount: totalValue,
          status: 'Approved',
          notes: `Purchase return ${purchaseReturn.return_no}: ${dto.reason}`,
        },
      });

      // Supplier ledger: a Purchase_Return reverses part of the original
      // Purchase_Invoice credit, so — following the accounts-payable
      // convention already established in SUPPLIER-01 (Purchase_Invoice
      // credits/increases the amount owed; Payment/Advance debit/decrease
      // it) — it DEBITS the ledger by the same amount, reducing what we
      // owe the supplier. Locking the supplier row here serializes this
      // with concurrent SUPPLIER-01 payments on the same supplier.
      await tx.$queryRaw`SELECT id FROM suppliers WHERE id = ${invoice.supplier_id}::uuid FOR UPDATE`;

      const lastLedgerEntry = await tx.supplier_ledger.findFirst({
        where: { supplier_id: invoice.supplier_id },
        orderBy: { created_at: 'desc' },
        select: { balance_after: true },
      });

      const currentBalance = lastLedgerEntry
        ? new Prisma.Decimal(lastLedgerEntry.balance_after)
        : new Prisma.Decimal(0);
      const balanceAfter = currentBalance.minus(totalValue);

      await tx.supplier_ledger.create({
        data: {
          supplier_id: invoice.supplier_id,
          entry_type: 'Purchase_Return',
          reference_type: 'purchase_return',
          reference_id: purchaseReturn.id,
          debit_amount: totalValue,
          credit_amount: new Prisma.Decimal(0),
          balance_after: balanceAfter,
          notes: `Purchase return ${purchaseReturn.return_no}`,
        },
      });

      return tx.purchase_returns.findUnique({
        where: { id: purchaseReturn.id },
        include: { purchase_return_items: true },
      });
    });
  }

  async findOne(id: string) {
    const purchaseReturn = await this.prisma.purchase_returns.findUnique({
      where: { id },
      include: { purchase_return_items: true },
    });

    if (!purchaseReturn) {
      throw new NotFoundException('Purchase return not found');
    }

    return purchaseReturn;
  }

  async findAll(params: { supplierId?: string; page?: number; limit?: number }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where: Prisma.purchase_returnsWhereInput = {
      ...(params.supplierId ? { supplier_id: params.supplierId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.purchase_returns.findMany({
        where,
        orderBy: [{ return_date: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchase_returns.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }
}
