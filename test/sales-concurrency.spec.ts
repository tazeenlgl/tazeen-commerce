/**
 * Real-PostgreSQL concurrency and integrity tests for SALES-01, following the same pattern
 * as INVENTORY-01 / CUSTOMER-02. Skips entirely when DATABASE_URL is unavailable — never
 * reports a skipped run as passed.
 */
import { PrismaService } from '../src/prisma/prisma.service';
import { SalesService } from '../src/modules/sales/sales.service';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/sales-concurrency.spec.ts requires DATABASE_URL pointing at a real ' +
      'Postgres instance. Sales concurrency was NOT verified in this run.',
  );
}

describeIfDb('sales invoice foundation (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let sales: SalesService;
  let locationId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    sales = new SalesService(prisma);

    const location = await prisma.locations.create({
      data: {
        location_code: `SALESTEST${Date.now().toString(36)}`.slice(0, 50),
        location_name: 'Sales Test Store',
        location_type: 'Retail_Store',
        status: 'Active',
      },
    });
    locationId = location.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function makeCategory() {
    return prisma.product_categories.create({
      data: {
        category_code: `CAT${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(0, 50),
        category_name: 'Test Category',
        status: 'Active',
      },
    });
  }

  async function makeSku(opts: { mrp: number; gstRate: number; stock: number }) {
    const category = await makeCategory();
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

    const product = await prisma.products.create({
      data: {
        product_id: `P${suffix}`.slice(0, 50),
        core_sku: `CORE${suffix}`.slice(0, 50),
        product_name: 'Test Product',
        category_id: category.id,
        gst_rate: opts.gstRate,
        purchase_rate: opts.mrp,
        status: 'Active',
      },
    });

    const sku = await prisma.product_skus.create({
      data: {
        product_id: product.id,
        sku: `SKU${suffix}`.slice(0, 50),
        sequence_no: 1,
        mrp: opts.mrp,
        status: 'Active',
      },
    });

    await prisma.inventory_stock.create({
      data: { sku_id: sku.id, location_id: locationId, quantity: opts.stock },
    });

    return sku;
  }

  async function makeCustomer(withWalletBalance?: number) {
    const customer = await prisma.customers.create({
      data: {
        customer_id: `S${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(0, 20),
        phone: `9${String(Date.now()).slice(-9)}`.slice(0, 10),
        status: 'Active',
      },
    });

    if (withWalletBalance !== undefined) {
      await prisma.customer_wallets.create({
        data: { customer_id: customer.id, balance: withWalletBalance },
      });
    }

    return customer;
  }

  it('creates a normal multi-item sale with reconciled totals', async () => {
    const skuA = await makeSku({ mrp: 118, gstRate: 18, stock: 10 });
    const skuB = await makeSku({ mrp: 236, gstRate: 18, stock: 10 });

    const invoice = await sales.create({
      location_id: locationId,
      items: [
        { sku_id: skuA.id, quantity: 2 },
        { sku_id: skuB.id, quantity: 1 },
      ],
      payments: [{ payment_method: 'Cash', amount: 472 }],
    } as never);

    expect(invoice!.invoice_no).toMatch(/^TAZ-\d{5}-\d{2}-\d{2}$/);
    expect(Number(invoice!.final_payable)).toBe(472);
    expect(invoice!.sales_invoice_items).toHaveLength(2);

    const sumTotalValue = invoice!.sales_invoice_items.reduce(
      (s, i) => s + Number(i.total_value),
      0,
    );
    expect(sumTotalValue).toBeCloseTo(472, 2);
  }, 20000);

  it('supports duplicate SKU lines in the same sale', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });

    const invoice = await sales.create({
      location_id: locationId,
      items: [
        { sku_id: sku.id, quantity: 1 },
        { sku_id: sku.id, quantity: 2 },
      ],
      payments: [{ payment_method: 'Cash', amount: 300 }],
    } as never);

    expect(invoice!.sales_invoice_items).toHaveLength(2);

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(7);
  }, 20000);

  it('allocates bill discount proportionally and reconciles totals exactly', async () => {
    const skuA = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuB = await makeSku({ mrp: 200, gstRate: 0, stock: 10 });

    const invoice = await sales.create({
      location_id: locationId,
      bill_discount: 30,
      items: [
        { sku_id: skuA.id, quantity: 1 },
        { sku_id: skuB.id, quantity: 1 },
      ],
      payments: [{ payment_method: 'Cash', amount: 270 }],
    } as never);

    expect(Number(invoice!.bill_discount)).toBe(30);
    expect(Number(invoice!.final_payable)).toBe(270);

    const sumTotalValue = invoice!.sales_invoice_items.reduce(
      (s, i) => s + Number(i.total_value),
      0,
    );
    expect(sumTotalValue).toBeCloseTo(270, 2);

    // Proportional: skuB (200) carries 2x the discount share of skuA (100).
    const itemA = invoice!.sales_invoice_items.find((i) => i.sku_id === skuA.id)!;
    const itemB = invoice!.sales_invoice_items.find((i) => i.sku_id === skuB.id)!;
    expect(Number(itemA.discount_amount)).toBeCloseTo(10, 2);
    expect(Number(itemB.discount_amount)).toBeCloseTo(20, 2);
  }, 20000);

  it('rejects a sale with insufficient stock and leaves no partial rows', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 1 });

    await expect(
      sales.create({
        location_id: locationId,
        items: [{ sku_id: sku.id, quantity: 5 }],
        payments: [{ payment_method: 'Cash', amount: 500 }],
      } as never),
    ).rejects.toThrow();

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(1);

    const movements = await prisma.inventory_movements.findMany({ where: { sku_id: sku.id } });
    expect(movements).toHaveLength(0);
  }, 20000);

  it('serializes concurrent sales on the same SKU without overselling', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 5 });

    const attempt = () =>
      sales.create({
        location_id: locationId,
        items: [{ sku_id: sku.id, quantity: 3 }],
        payments: [{ payment_method: 'Cash', amount: 300 }],
      } as never);

    const results = await Promise.allSettled([attempt(), attempt()]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // 5 - 3 - 3 = -1: both can never succeed.
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBeGreaterThanOrEqual(0);
    expect(stock?.quantity).toBe(2);
  }, 20000);

  it('processes a wallet payment atomically, debiting the correct amount', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const customer = await makeCustomer(150);

    const invoice = await sales.create({
      location_id: locationId,
      customer_id: customer.id,
      items: [{ sku_id: sku.id, quantity: 1 }],
      payments: [{ payment_method: 'Wallet', amount: 100 }],
    } as never);

    expect(invoice!.customer_id).toBe(customer.id);

    const wallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(wallet?.balance)).toBe(50);
  }, 20000);

  it('wallet payment exceeding balance rolls back the entire sale', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const customer = await makeCustomer(10);

    await expect(
      sales.create({
        location_id: locationId,
        customer_id: customer.id,
        items: [{ sku_id: sku.id, quantity: 1 }],
        payments: [{ payment_method: 'Wallet', amount: 100 }],
      } as never),
    ).rejects.toThrow();

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(10);

    const wallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(wallet?.balance)).toBe(10);

    const invoices = await prisma.sales_invoices.findMany({ where: { customer_id: customer.id } });
    expect(invoices).toHaveLength(0);
  }, 20000);

  it('preserves customer linkage on the created invoice', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const customer = await makeCustomer();

    const invoice = await sales.create({
      location_id: locationId,
      customer_id: customer.id,
      items: [{ sku_id: sku.id, quantity: 1 }],
      payments: [{ payment_method: 'Cash', amount: 100 }],
    } as never);

    expect(invoice!.customer_id).toBe(customer.id);
  }, 20000);

  it('allocates unique sequential invoice numbers under concurrent creation', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 20 });

    const results = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        sales.create({
          location_id: locationId,
          items: [{ sku_id: sku.id, quantity: 1 }],
          payments: [{ payment_method: 'Cash', amount: 100 }],
        } as never),
      ),
    );

    const invoiceNumbers = results.map((r) => r!.invoice_no);
    expect(new Set(invoiceNumbers).size).toBe(5);
  }, 30000);

  it('computes financial year boundaries around 1 April without touching server time', () => {
    expect(sales.computeFinancialYear(new Date('2026-03-31T12:00:00Z'))).toBe('25-26');
    expect(sales.computeFinancialYear(new Date('2026-04-01T00:00:00Z'))).toBe('26-27');
    expect(sales.computeFinancialYear(new Date('2027-03-31T23:59:59Z'))).toBe('26-27');
    expect(sales.computeFinancialYear(new Date('2027-04-01T00:00:00Z'))).toBe('27-28');
  });
});
