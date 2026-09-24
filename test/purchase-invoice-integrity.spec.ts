/**
 * Real-PostgreSQL integrity tests for the Purchase Invoice lifecycle beyond what
 * INVENTORY-01's concurrency suite already covers (single-item double-receive/lost-update).
 * Skips entirely when DATABASE_URL is unavailable — never reports a skipped run as passed.
 */
import { PrismaService } from '../src/prisma/prisma.service';
import { PurchaseInvoicesService } from '../src/modules/purchase-invoices/purchase-invoices.service';
import { PurchaseTaxModeDto } from '../src/modules/purchase-invoices/dto/create-purchase-invoice.dto';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/purchase-invoice-integrity.spec.ts requires DATABASE_URL pointing at a ' +
      'real Postgres instance. These checks were NOT verified in this run.',
  );
}

describeIfDb('purchase invoice lifecycle integrity (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let purchaseInvoices: PurchaseInvoicesService;

  let categoryId: string;
  let warehouseId: string;
  let retailStoreId: string;
  let supplierId: string;
  let inactiveSupplierId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    purchaseInvoices = new PurchaseInvoicesService(prisma);

    const category = await prisma.product_categories.create({
      data: { category_code: `PII-CAT-${Date.now()}`, category_name: 'Purchase Integrity Category' },
    });
    categoryId = category.id;

    const warehouse = await prisma.locations.create({
      data: {
        location_code: `PII-WH-${Date.now()}`,
        location_name: 'Purchase Integrity Warehouse',
        location_type: 'Warehouse',
        status: 'Active',
      },
    });
    warehouseId = warehouse.id;

    const retail = await prisma.locations.create({
      data: {
        location_code: `PII-RS-${Date.now()}`,
        location_name: 'Purchase Integrity Retail Store',
        location_type: 'Retail_Store',
        status: 'Active',
      },
    });
    retailStoreId = retail.id;

    const supplier = await prisma.supplier.create({
      data: {
        supplierCode: `PII-SUP-${Date.now()}`,
        supplierName: 'Purchase Integrity Supplier',
        mobile: '9999999999',
        status: 'ACTIVE',
      },
    });
    supplierId = supplier.id;

    const inactiveSupplier = await prisma.supplier.create({
      data: {
        supplierCode: `PII-SUP-INACTIVE-${Date.now()}`,
        supplierName: 'Purchase Integrity Inactive Supplier',
        mobile: '8888888888',
        status: 'INACTIVE',
      },
    });
    inactiveSupplierId = inactiveSupplier.id;
  });

  afterAll(async () => {
    await prisma.inventory_movements.deleteMany({ where: { location_id: warehouseId } });
    await prisma.inventory_stock.deleteMany({ where: { location_id: warehouseId } });
    await prisma.purchase_invoice_items.deleteMany({
      where: { products: { category_id: categoryId } },
    });
    await prisma.purchase_invoices.deleteMany({ where: { supplier_id: { in: [supplierId, inactiveSupplierId] } } });
    await prisma.product_skus.deleteMany({ where: { products: { category_id: categoryId } } });
    await prisma.products.deleteMany({ where: { category_id: categoryId } });
    await prisma.locations.deleteMany({ where: { id: { in: [warehouseId, retailStoreId] } } });
    await prisma.supplier.deleteMany({ where: { id: { in: [supplierId, inactiveSupplierId] } } });
    await prisma.product_categories.delete({ where: { id: categoryId } });
    await prisma.$disconnect();
  });

  async function makeProductAndSku(seq: number, purchaseRate = 100, gstRate = 0) {
    const product = await prisma.products.create({
      data: {
        product_id: `PII-PROD-${Date.now()}-${seq}`,
        core_sku: `PII-CORE-${Date.now()}-${seq}`,
        product_name: `Purchase Integrity Product ${seq}`,
        category_id: categoryId,
        gst_rate: gstRate,
        purchase_rate: purchaseRate,
        status: 'Active',
      },
    });

    const sku = await prisma.product_skus.create({
      data: {
        product_id: product.id,
        sku: `PII-SKU-${Date.now()}-${seq}`,
        sequence_no: 1,
        mrp: purchaseRate * 1.5,
        status: 'Active',
      },
    });

    return { product, sku };
  }

  it('receiving an invoice with two line items for the same SKU correctly sums both into one stock row', async () => {
    const { product, sku } = await makeProductAndSku(1);

    const invoice = await prisma.purchase_invoices.create({
      data: {
        id: crypto.randomUUID(),
        supplier_id: supplierId,
        supplier_name: 'Purchase Integrity Supplier',
        invoice_no: `PII-INV-${Date.now()}`,
        purchase_date: new Date(),
        location: 'Purchase Integrity Warehouse',
        items_count: 2,
        taxable_value: 100,
        gst_rate: 0,
        gst_amount: 0,
        final_value: 100,
        document_name: '',
        status: 'Draft',
        updated_at: new Date(),
      },
    });

    // Two separate item rows for the SAME sku_id — create() does not dedupe by SKU, so this
    // is a realistic invoice shape (e.g. two batches of the same product on one bill).
    await prisma.purchase_invoice_items.createMany({
      data: [
        {
          purchase_invoice_id: invoice.id,
          sku_id: sku.id,
          product_id: product.id,
          quantity: 4,
          purchase_rate: 100,
          gst_rate: 0,
          taxable_value: 400,
          gst_amount: 0,
          total_value: 400,
        },
        {
          purchase_invoice_id: invoice.id,
          sku_id: sku.id,
          product_id: product.id,
          quantity: 6,
          purchase_rate: 100,
          gst_rate: 0,
          taxable_value: 600,
          gst_amount: 0,
          total_value: 600,
        },
      ],
    });

    await purchaseInvoices.receive(invoice.id);

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: warehouseId } },
    });
    // Both item rows must be applied — 4 + 6 = 10, not just one of them (lost update within
    // the same transaction) and not double-applied.
    expect(stock?.quantity).toBe(10);

    const movements = await prisma.inventory_movements.findMany({
      where: { sku_id: sku.id, location_id: warehouseId, reference_id: invoice.id },
      orderBy: { created_at: 'asc' },
    });
    expect(movements).toHaveLength(2);
    expect(movements[0].quantity_before).toBe(0);
    expect(movements[0].quantity_after).toBe(4);
    // Second movement's "before" must chain off the first, not re-read a stale 0.
    expect(movements[1].quantity_before).toBe(4);
    expect(movements[1].quantity_after).toBe(10);
  }, 20000);

  it('rejects receiving an invoice whose stored location is a Retail Store, not a Warehouse', async () => {
    // Mirrors create()'s own Warehouse-only rule; simulates a location that was Warehouse at
    // creation time but no longer resolves to an active Warehouse by that name at receive time.
    const { product, sku } = await makeProductAndSku(2);

    const invoice = await prisma.purchase_invoices.create({
      data: {
        id: crypto.randomUUID(),
        supplier_id: supplierId,
        supplier_name: 'Purchase Integrity Supplier',
        invoice_no: `PII-INV-RETAIL-${Date.now()}`,
        purchase_date: new Date(),
        location: 'Purchase Integrity Retail Store',
        items_count: 1,
        taxable_value: 100,
        gst_rate: 0,
        gst_amount: 0,
        final_value: 100,
        document_name: '',
        status: 'Draft',
        updated_at: new Date(),
      },
    });

    await prisma.purchase_invoice_items.create({
      data: {
        purchase_invoice_id: invoice.id,
        sku_id: sku.id,
        product_id: product.id,
        quantity: 5,
        purchase_rate: 100,
        gst_rate: 0,
        taxable_value: 500,
        gst_amount: 0,
        total_value: 500,
      },
    });

    await expect(purchaseInvoices.receive(invoice.id)).rejects.toThrow();

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: retailStoreId } },
    });
    expect(stock).toBeNull();

    const finalInvoice = await prisma.purchase_invoices.findUnique({ where: { id: invoice.id } });
    expect(finalInvoice?.status).toBe('Draft'); // rejected atomically, no partial state change
  }, 20000);

  it('rejects receiving an already-Cancelled invoice (invalid state transition)', async () => {
    const { product, sku } = await makeProductAndSku(3);

    const invoice = await prisma.purchase_invoices.create({
      data: {
        id: crypto.randomUUID(),
        supplier_id: supplierId,
        supplier_name: 'Purchase Integrity Supplier',
        invoice_no: `PII-INV-CANCELLED-${Date.now()}`,
        purchase_date: new Date(),
        location: 'Purchase Integrity Warehouse',
        items_count: 1,
        taxable_value: 100,
        gst_rate: 0,
        gst_amount: 0,
        final_value: 100,
        document_name: '',
        status: 'Cancelled',
        updated_at: new Date(),
      },
    });

    await prisma.purchase_invoice_items.create({
      data: {
        purchase_invoice_id: invoice.id,
        sku_id: sku.id,
        product_id: product.id,
        quantity: 3,
        purchase_rate: 100,
        gst_rate: 0,
        taxable_value: 300,
        gst_amount: 0,
        total_value: 300,
      },
    });

    await expect(purchaseInvoices.receive(invoice.id)).rejects.toThrow();

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: warehouseId } },
    });
    expect(stock).toBeNull();
  }, 20000);

  it('rejects creating a purchase invoice for an inactive supplier (existing create() rule)', async () => {
    const { sku } = await makeProductAndSku(4);

    await expect(
      purchaseInvoices.create({
        supplier_id: inactiveSupplierId,
        invoice_no: `PII-INV-INACTIVE-SUP-${Date.now()}`,
        purchase_date: new Date().toISOString().slice(0, 10),
        location_id: warehouseId,
        tax_mode: PurchaseTaxModeDto.INTRA_STATE,
        items: [{ sku_id: sku.id, quantity: 2, purchase_rate: '100', gst_rate: '0' }],
      }),
    ).rejects.toThrow();

    const invoices = await prisma.purchase_invoices.findMany({ where: { supplier_id: inactiveSupplierId } });
    expect(invoices).toHaveLength(0); // no partial invoice/items left behind
  }, 20000);

  it('create() ignores client-supplied purchase_rate/gst_rate and always uses the product-level authority', async () => {
    const { sku } = await makeProductAndSku(5, 200, 5);

    const invoice = await purchaseInvoices.create({
      supplier_id: supplierId,
      invoice_no: `PII-INV-RATE-${Date.now()}`,
      purchase_date: new Date().toISOString().slice(0, 10),
      location_id: warehouseId,
      tax_mode: PurchaseTaxModeDto.INTRA_STATE,
      // Client tries to under-report the rate and GST; the product record says 200 / 5%.
      items: [{ sku_id: sku.id, quantity: 1, purchase_rate: '1', gst_rate: '0' }],
    });

    const items = await prisma.purchase_invoice_items.findMany({ where: { purchase_invoice_id: invoice.id } });
    expect(items).toHaveLength(1);
    expect(Number(items[0].purchase_rate)).toBe(200);
    expect(Number(items[0].gst_rate)).toBe(5);
  }, 20000);

  it('duplicate supplier invoice numbers are currently permitted (no uniqueness rule exists in schema or service)', async () => {
    // This is a documentation-by-test of the CURRENT established behavior, not an endorsement:
    // there is no @@unique on invoice_no (or invoice_no+supplier_id) in prisma/schema.prisma,
    // and create() performs no duplicate check. Per task scope, no new rule is invented here.
    const { sku } = await makeProductAndSku(6);
    const sharedInvoiceNo = `PII-INV-DUP-${Date.now()}`;

    const first = await purchaseInvoices.create({
      supplier_id: supplierId,
      invoice_no: sharedInvoiceNo,
      purchase_date: new Date().toISOString().slice(0, 10),
      location_id: warehouseId,
      tax_mode: PurchaseTaxModeDto.INTRA_STATE,
      items: [{ sku_id: sku.id, quantity: 1, purchase_rate: '100', gst_rate: '0' }],
    });

    const second = await purchaseInvoices.create({
      supplier_id: supplierId,
      invoice_no: sharedInvoiceNo,
      purchase_date: new Date().toISOString().slice(0, 10),
      location_id: warehouseId,
      tax_mode: PurchaseTaxModeDto.INTRA_STATE,
      items: [{ sku_id: sku.id, quantity: 1, purchase_rate: '100', gst_rate: '0' }],
    });

    expect(first.id).not.toBe(second.id);
    expect(first.invoice_no).toBe(second.invoice_no);
  }, 20000);
});
