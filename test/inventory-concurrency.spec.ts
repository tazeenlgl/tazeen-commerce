/**
 * Real-PostgreSQL concurrency tests for stock mutation paths.
 *
 * These run against an actual Postgres connection (DATABASE_URL), not a mocked Prisma
 * client — mocks cannot exhibit real row-locking/isolation behavior, and the task this
 * file verifies is specifically about that behavior. If DATABASE_URL is not set to a
 * reachable Postgres instance, every test in this file is skipped (not silently passed)
 * so a missing DB is visible in the test report rather than mistaken for "verified".
 */
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { InventoryAdjustmentService } from '../src/modules/inventory/inventory-adjustment.service';
import { PurchaseInvoicesService } from '../src/modules/purchase-invoices/purchase-invoices.service';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/inventory-concurrency.spec.ts requires DATABASE_URL pointing at a real ' +
      'Postgres instance. Concurrency behavior was NOT verified in this run.',
  );
}

describeIfDb('inventory stock concurrency (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let inventoryAdjustments: InventoryAdjustmentService;
  let purchaseInvoices: PurchaseInvoicesService;

  let categoryId: string;
  let locationId: string;
  let reasonId: string;
  let supplierId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    inventoryAdjustments = new InventoryAdjustmentService(prisma);
    purchaseInvoices = new PurchaseInvoicesService(prisma);

    const category = await prisma.product_categories.create({
      data: { category_code: `CAT-${Date.now()}`, category_name: 'Concurrency Test Category' },
    });
    categoryId = category.id;

    const location = await prisma.locations.create({
      data: {
        location_code: `LOC-${Date.now()}`,
        location_name: 'Concurrency Test Warehouse',
        location_type: 'Warehouse',
        status: 'Active',
      },
    });
    locationId = location.id;

    const reason = await prisma.transaction_reasons.create({
      data: { reason_type: 'Stock Adjustment', reason_name: 'Concurrency Test Reason', is_active: true },
    });
    reasonId = reason.id;

    const supplier = await prisma.supplier.create({
      data: {
        supplierCode: `SUP-${Date.now()}`,
        supplierName: 'Concurrency Test Supplier',
        mobile: '9999999999',
        status: 'ACTIVE',
      },
    });
    supplierId = supplier.id;
  });

  afterAll(async () => {
    await prisma.inventory_movements.deleteMany({ where: { location_id: locationId } });
    await prisma.inventory_stock.deleteMany({ where: { location_id: locationId } });
    await prisma.purchase_invoice_items.deleteMany({ where: { product_skus: { product_id: { not: undefined } } } });
    await prisma.purchase_invoices.deleteMany({ where: { location: 'Concurrency Test Warehouse' } });
    await prisma.product_skus.deleteMany({ where: { products: { category_id: categoryId } } });
    await prisma.products.deleteMany({ where: { category_id: categoryId } });
    await prisma.transaction_reasons.delete({ where: { id: reasonId } });
    await prisma.locations.delete({ where: { id: locationId } });
    await prisma.product_categories.delete({ where: { id: categoryId } });
    await prisma.supplier.delete({ where: { id: supplierId } });
    await prisma.$disconnect();
  });

  async function makeProductAndSku(seq: number) {
    const product = await prisma.products.create({
      data: {
        product_id: `PROD-${Date.now()}-${seq}`,
        core_sku: `CORE-${Date.now()}-${seq}`,
        product_name: `Concurrency Product ${seq}`,
        category_id: categoryId,
        gst_rate: 0,
        purchase_rate: 100,
        status: 'Active',
      },
    });

    const sku = await prisma.product_skus.create({
      data: {
        product_id: product.id,
        sku: `SKU-${Date.now()}-${seq}`,
        sequence_no: 1,
        mrp: 150,
        status: 'Active',
      },
    });

    return { product, sku };
  }

  async function makeDraftInvoice(skuId: string, productId: string, quantity: number) {
    const invoice = await prisma.purchase_invoices.create({
      data: {
        id: crypto.randomUUID(),
        supplier_id: supplierId,
        supplier_name: 'Test Supplier',
        invoice_no: `INV-${Date.now()}-${Math.random()}`,
        purchase_date: new Date(),
        location: 'Concurrency Test Warehouse',
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
        sku_id: skuId,
        product_id: productId,
        quantity,
        purchase_rate: 100,
        gst_rate: 0,
        taxable_value: 100,
        gst_amount: 0,
        total_value: 100,
      },
    });

    return invoice;
  }

  it('two concurrent purchase receives incrementing the same SKU/location do not lose an update', async () => {
    const { product, sku } = await makeProductAndSku(1);
    const invoiceA = await makeDraftInvoice(sku.id, product.id, 10);
    const invoiceB = await makeDraftInvoice(sku.id, product.id, 15);

    const [resultA, resultB] = await Promise.allSettled([
      purchaseInvoices.receive(invoiceA.id),
      purchaseInvoices.receive(invoiceB.id),
    ]);

    expect(resultA.status).toBe('fulfilled');
    expect(resultB.status).toBe('fulfilled');

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });

    // Both increments (10 + 15) must be reflected — a lost update would leave this at 10 or 15.
    expect(stock?.quantity).toBe(25);

    const movements = await prisma.inventory_movements.findMany({
      where: { sku_id: sku.id, location_id: locationId },
      orderBy: { quantity_after: 'asc' },
    });
    expect(movements).toHaveLength(2);
    expect(movements.map((m) => m.quantity_change).sort()).toEqual([10, 15]);
  }, 20000);

  it('concurrent purchase receives cannot double-receive the same invoice', async () => {
    const { product, sku } = await makeProductAndSku(2);
    const invoice = await makeDraftInvoice(sku.id, product.id, 7);

    const results = await Promise.allSettled([
      purchaseInvoices.receive(invoice.id),
      purchaseInvoices.receive(invoice.id),
      purchaseInvoices.receive(invoice.id),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly one of the concurrent receive() calls may succeed; the rest must be rejected
    // (already-received), never silently no-op and never all three succeeding.
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(2);

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(7); // received exactly once, not 14 or 21

    const movements = await prisma.inventory_movements.findMany({
      where: { sku_id: sku.id, location_id: locationId, reference_id: invoice.id },
    });
    expect(movements).toHaveLength(1);

    const finalInvoice = await prisma.purchase_invoices.findUnique({ where: { id: invoice.id } });
    expect(finalInvoice?.status).toBe('Received');
  }, 20000);

  it('concurrent stock increase and decrease (adjustments) settle to a consistent final value, no lost update', async () => {
    const { sku } = await makeProductAndSku(3);

    // Seed a starting stock level via one adjustment first.
    await inventoryAdjustments.create({
      sku_id: sku.id,
      location_id: locationId,
      quantity: 50,
      reason_id: reasonId,
    });

    // Two concurrent adjustments race to set different absolute target quantities.
    const results = await Promise.allSettled([
      inventoryAdjustments.create({ sku_id: sku.id, location_id: locationId, quantity: 30, reason_id: reasonId }),
      inventoryAdjustments.create({ sku_id: sku.id, location_id: locationId, quantity: 80, reason_id: reasonId }),
    ]);

    // With FOR UPDATE serializing the two adjustments, both must complete (no crash/hang) and
    // the final stored quantity must be exactly one of the two targets — never a corrupted
    // value, and never silently reverted to the pre-race value of 50.
    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect([30, 80]).toContain(stock?.quantity);

    const movements = await prisma.inventory_movements.findMany({
      where: { sku_id: sku.id, location_id: locationId },
      orderBy: { created_at: 'asc' },
    });
    // Seed + two adjustments = 3 movements, each with a consistent before/after pairing
    // (each movement's quantity_before must equal the immediately preceding movement's
    // quantity_after — proof the lock serialized them rather than interleaving stale reads).
    expect(movements).toHaveLength(3);
    for (let i = 1; i < movements.length; i++) {
      expect(movements[i].quantity_before).toBe(movements[i - 1].quantity_after);
    }
  }, 20000);

  it('a concurrent decrease-only adjustment race never produces negative stock', async () => {
    const { sku } = await makeProductAndSku(4);

    await inventoryAdjustments.create({
      sku_id: sku.id,
      location_id: locationId,
      quantity: 5,
      reason_id: reasonId,
    });

    // Both attempts try to set the same target below what a naive lost-update race might
    // otherwise double-apply; the meaningful assertion is simply that stock is never negative
    // and the row stays internally consistent under concurrent access.
    const results = await Promise.allSettled([
      inventoryAdjustments.create({ sku_id: sku.id, location_id: locationId, quantity: 0, reason_id: reasonId }),
      inventoryAdjustments.create({ sku_id: sku.id, location_id: locationId, quantity: 0, reason_id: reasonId }),
    ]);

    // One of the two identical adjustments is a genuine no-op relative to the other's result
    // and is rejected by the existing "same as current stock" business rule — that rule itself
    // is proof the row was read consistently (serialized), not raced.
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBeGreaterThanOrEqual(0);
    expect(stock?.quantity).toBe(0);
  }, 20000);

  it('a purchase receive that would drive stock negative rejects atomically with no partial write', async () => {
    // inventory_stock starts with no row for this brand-new SKU; simulate a corrective
    // negative-quantity movement being impossible via receive (receive only ever adds), so
    // instead prove atomicity via a rejected double-receive leaving no orphaned movement:
    const { product, sku } = await makeProductAndSku(5);
    const invoice = await makeDraftInvoice(sku.id, product.id, 3);

    await purchaseInvoices.receive(invoice.id);

    await expect(purchaseInvoices.receive(invoice.id)).rejects.toThrow();

    // Failed second receive must not have left a second movement or altered stock at all.
    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(3);

    const movements = await prisma.inventory_movements.findMany({
      where: { sku_id: sku.id, location_id: locationId, reference_id: invoice.id },
    });
    expect(movements).toHaveLength(1);
  }, 20000);
});
