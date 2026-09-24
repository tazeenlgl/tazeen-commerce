/**
 * Real-PostgreSQL concurrency and integrity tests for PURCHASE-RETURN-01, following the same
 * pattern as SALES-02/SUPPLIER-01. Skips entirely when DATABASE_URL is unavailable — never
 * reports a skipped run as passed.
 */
import { PrismaService } from '../src/prisma/prisma.service';
import { PurchaseInvoicesService } from '../src/modules/purchase-invoices/purchase-invoices.service';
import {
  PurchaseTaxModeDto,
} from '../src/modules/purchase-invoices/dto/create-purchase-invoice.dto';
import { PurchaseReturnsService } from '../src/modules/purchase-returns/purchase-returns.service';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/purchase-returns-concurrency.spec.ts requires DATABASE_URL pointing at a ' +
      'real Postgres instance. Purchase return concurrency was NOT verified in this run.',
  );
}

describeIfDb('purchase returns (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let purchaseInvoices: PurchaseInvoicesService;
  let returns: PurchaseReturnsService;
  let locationId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    purchaseInvoices = new PurchaseInvoicesService(prisma);
    returns = new PurchaseReturnsService(prisma);

    const location = await prisma.locations.create({
      data: {
        location_code: `PRETTEST${Date.now().toString(36)}`.slice(0, 50),
        location_name: `Warehouse${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        location_type: 'Warehouse',
        status: 'Active',
      },
    });
    locationId = location.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function makeSupplier(status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE') {
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    return prisma.supplier.create({
      data: {
        supplierCode: `SUP${suffix}`.slice(0, 50),
        supplierName: 'Test Supplier',
        mobile: `9${String(Date.now()).slice(-9)}`.slice(0, 10),
        status,
      },
    });
  }

  async function makeSku(gstRate: number, purchaseRate: number) {
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const category = await prisma.product_categories.create({
      data: { category_code: `CAT${suffix}`.slice(0, 50), category_name: 'Test Category', status: 'Active' },
    });
    const product = await prisma.products.create({
      data: {
        product_id: `P${suffix}`.slice(0, 50),
        core_sku: `CORE${suffix}`.slice(0, 50),
        product_name: 'Test Product',
        category_id: category.id,
        gst_rate: gstRate,
        purchase_rate: purchaseRate,
        status: 'Active',
      },
    });
    return prisma.product_skus.create({
      data: {
        product_id: product.id,
        sku: `SKU${suffix}`.slice(0, 50),
        sequence_no: 1,
        mrp: purchaseRate * 1.5,
        status: 'Active',
      },
    });
  }

  async function makeReceivedInvoice(supplierId: string, sku: { id: string }, quantity: number) {
    const invoice = await purchaseInvoices.create({
      supplier_id: supplierId,
      invoice_no: `INV${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      purchase_date: '2026-04-05',
      location_id: locationId,
      tax_mode: PurchaseTaxModeDto.INTRA_STATE,
      items: [{ sku_id: sku.id, quantity, purchase_rate: '0', gst_rate: '0' }],
    } as never);
    const received = await purchaseInvoices.receive(invoice.id);
    const full = await purchaseInvoices.findOne(invoice.id);
    return { invoice: full, received };
  }

  it('processes a normal partial return: restocks reversed and ledger debited', async () => {
    const supplier = await makeSupplier();
    const sku = await makeSku(0, 100);
    const { invoice } = await makeReceivedInvoice(supplier.id, sku, 10);
    const item = invoice.purchase_invoice_items[0];

    const result = await returns.create({
      purchase_invoice_id: invoice.id,
      reason: 'Damaged',
      items: [{ original_invoice_item_id: item.id, quantity: 3 }],
    } as never);

    expect(result!.return_no).toMatch(/^PRET-\d{5}-\d{2}-\d{2}$/);
    expect(Number(result!.total_value)).toBe(300);

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(7); // 10 received - 3 returned

    const ledger = await prisma.supplier_ledger.findMany({ where: { supplier_id: supplier.id } });
    // No code posts a Purchase_Invoice ledger entry (out of SUPPLIER-01's
    // scope), so the only entry here is this return's Purchase_Return debit.
    expect(ledger).toHaveLength(1);
    expect(ledger[0].entry_type).toBe('Purchase_Return');
    expect(Number(ledger[0].debit_amount)).toBe(300);
    expect(Number(ledger[0].balance_after)).toBe(-300);

    const creditNotes = await prisma.supplier_credit_notes.findMany({
      where: { purchase_invoice_id: invoice.id },
    });
    expect(creditNotes).toHaveLength(1);
    expect(Number(creditNotes[0].amount)).toBe(300);
  }, 20000);

  it('processes a full return of an invoice line', async () => {
    const supplier = await makeSupplier();
    const sku = await makeSku(0, 50);
    const { invoice } = await makeReceivedInvoice(supplier.id, sku, 4);
    const item = invoice.purchase_invoice_items[0];

    const result = await returns.create({
      purchase_invoice_id: invoice.id,
      reason: 'Full return',
      items: [{ original_invoice_item_id: item.id, quantity: 4 }],
    } as never);

    expect(Number(result!.total_value)).toBe(200);

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(0);
  }, 20000);

  it('supports multiple sequential returns against the same invoice', async () => {
    const supplier = await makeSupplier();
    const sku = await makeSku(0, 100);
    const { invoice } = await makeReceivedInvoice(supplier.id, sku, 10);
    const item = invoice.purchase_invoice_items[0];

    await returns.create({
      purchase_invoice_id: invoice.id,
      reason: 'Return 1',
      items: [{ original_invoice_item_id: item.id, quantity: 2 }],
    } as never);
    const second = await returns.create({
      purchase_invoice_id: invoice.id,
      reason: 'Return 2',
      items: [{ original_invoice_item_id: item.id, quantity: 3 }],
    } as never);

    expect(second).toBeTruthy();

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(5); // 10 - 2 - 3
  }, 20000);

  it('rejects a cumulative over-return across sequential requests', async () => {
    const supplier = await makeSupplier();
    const sku = await makeSku(0, 100);
    const { invoice } = await makeReceivedInvoice(supplier.id, sku, 5);
    const item = invoice.purchase_invoice_items[0];

    await returns.create({
      purchase_invoice_id: invoice.id,
      reason: 'Return 1',
      items: [{ original_invoice_item_id: item.id, quantity: 4 }],
    } as never);

    await expect(
      returns.create({
        purchase_invoice_id: invoice.id,
        reason: 'Return 2, over limit',
        items: [{ original_invoice_item_id: item.id, quantity: 2 }],
      } as never),
    ).rejects.toThrow();
  }, 20000);

  it('serializes concurrent returns against the same invoice line without over-returning', async () => {
    const supplier = await makeSupplier();
    const sku = await makeSku(0, 100);
    const { invoice } = await makeReceivedInvoice(supplier.id, sku, 5);
    const item = invoice.purchase_invoice_items[0];

    const attempt = (reason: string) =>
      returns.create({
        purchase_invoice_id: invoice.id,
        reason,
        items: [{ original_invoice_item_id: item.id, quantity: 4 }],
      } as never);

    const results = await Promise.allSettled([attempt('A'), attempt('B')]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Received qty is 5; two concurrent requests for 4 each can never both succeed.
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  }, 20000);

  it('debits the supplier ledger correctly and reconciles GST/value', async () => {
    const supplier = await makeSupplier();
    const sku = await makeSku(12, 112); // GST-inclusive purchase rate, 12% rate
    const { invoice } = await makeReceivedInvoice(supplier.id, sku, 10);
    const item = invoice.purchase_invoice_items[0];

    const result = await returns.create({
      purchase_invoice_id: invoice.id,
      reason: 'GST reconciliation check',
      items: [{ original_invoice_item_id: item.id, quantity: 5 }],
    } as never);

    // Half the invoice line's values, exactly.
    expect(Number(result!.total_value)).toBeCloseTo(Number(item.total_value) / 2, 2);
    expect(Number(result!.gst_amount)).toBeCloseTo(Number(item.gst_amount) / 2, 2);
    expect(Number(result!.taxable_value)).toBeCloseTo(Number(item.taxable_value) / 2, 2);

    const ledger = await prisma.supplier_ledger.findMany({
      where: { supplier_id: supplier.id, entry_type: 'Purchase_Return' },
    });
    expect(ledger).toHaveLength(1);
    expect(Number(ledger[0].debit_amount)).toBeCloseTo(Number(result!.total_value), 2);
    expect(Number(ledger[0].balance_after)).toBeCloseTo(-Number(result!.total_value), 2);
  }, 20000);

  it('rolls back everything when stock cannot support the return', async () => {
    const supplier = await makeSupplier();
    const sku = await makeSku(0, 100);
    const { invoice } = await makeReceivedInvoice(supplier.id, sku, 3);
    const item = invoice.purchase_invoice_items[0];

    // Drain stock out from under the invoice via a manual adjustment so the
    // guarded decrement inside the return transaction is forced to fail.
    await prisma.inventory_stock.update({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
      data: { quantity: 1 },
    });

    await expect(
      returns.create({
        purchase_invoice_id: invoice.id,
        reason: 'Forced stock shortfall',
        items: [{ original_invoice_item_id: item.id, quantity: 3 }],
      } as never),
    ).rejects.toThrow();

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(1); // unchanged

    const returnRows = await prisma.purchase_returns.findMany({
      where: { purchase_invoice_id: invoice.id },
    });
    expect(returnRows).toHaveLength(0);

    const ledgerRows = await prisma.supplier_ledger.findMany({
      where: { supplier_id: supplier.id, entry_type: 'Purchase_Return' },
    });
    expect(ledgerRows).toHaveLength(0);
  }, 20000);

  it('rejects a return against an inactive supplier', async () => {
    const supplier = await makeSupplier();
    const sku = await makeSku(0, 100);
    const { invoice } = await makeReceivedInvoice(supplier.id, sku, 5);
    const item = invoice.purchase_invoice_items[0];

    await prisma.supplier.update({ where: { id: supplier.id }, data: { status: 'INACTIVE' } });

    await expect(
      returns.create({
        purchase_invoice_id: invoice.id,
        reason: 'Should fail',
        items: [{ original_invoice_item_id: item.id, quantity: 1 }],
      } as never),
    ).rejects.toThrow();
  }, 20000);

  it('rejects a return against a non-existent purchase invoice', async () => {
    await expect(
      returns.create({
        purchase_invoice_id: '00000000-0000-0000-0000-000000000000',
        reason: 'Should fail',
        items: [{ original_invoice_item_id: '00000000-0000-0000-0000-000000000000', quantity: 1 }],
      } as never),
    ).rejects.toThrow();
  }, 20000);

  it('allocates unique sequential PRET numbers under concurrent creation', async () => {
    const supplier = await makeSupplier();
    const setups = [];
    for (let i = 0; i < 5; i += 1) {
      // Sequential setup avoids a phone/code-uniqueness collision from
      // parallel Date.now() calls; the returns themselves run concurrently.
      await new Promise((r) => setTimeout(r, i * 5));
      const sku = await makeSku(0, 100);
      setups.push({ sku, ...(await makeReceivedInvoice(supplier.id, sku, 5)) });
    }

    const results = await Promise.all(
      setups.map(({ invoice }) =>
        returns.create({
          purchase_invoice_id: invoice.id,
          reason: 'Concurrent numbering',
          items: [{ original_invoice_item_id: invoice.purchase_invoice_items[0].id, quantity: 1 }],
        } as never),
      ),
    );

    const returnNumbers = results.map((r) => r!.return_no);
    expect(new Set(returnNumbers).size).toBe(5);
  }, 30000);
});
