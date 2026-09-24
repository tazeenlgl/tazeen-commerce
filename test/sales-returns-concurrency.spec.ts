/**
 * Real-PostgreSQL concurrency and integrity tests for SALES-02 (plain sales returns),
 * following the same pattern as SALES-01's sales-concurrency.spec.ts. Skips entirely when
 * DATABASE_URL is unavailable — never reports a skipped run as passed.
 */
import { PrismaService } from '../src/prisma/prisma.service';
import { SalesService } from '../src/modules/sales/sales.service';
import { SalesReturnsService } from '../src/modules/sales-returns/sales-returns.service';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/sales-returns-concurrency.spec.ts requires DATABASE_URL pointing at a ' +
      'real Postgres instance. Sales return concurrency was NOT verified in this run.',
  );
}

describeIfDb('sales returns (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let sales: SalesService;
  let returns: SalesReturnsService;
  let locationId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    sales = new SalesService(prisma);
    returns = new SalesReturnsService(prisma);

    const location = await prisma.locations.create({
      data: {
        location_code: `RETTEST${Date.now().toString(36)}`.slice(0, 50),
        location_name: 'Returns Test Store',
        location_type: 'Retail_Store',
        status: 'Active',
      },
    });
    locationId = location.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function makeSku(opts: { mrp: number; gstRate: number; stock: number }) {
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

    const category = await prisma.product_categories.create({
      data: {
        category_code: `CAT${suffix}`.slice(0, 50),
        category_name: 'Test Category',
        status: 'Active',
      },
    });

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
        customer_id: `R${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(0, 20),
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

  async function makeSaleWithCustomer(sku: { id: string }, qty: number, walletBalance?: number) {
    const customer = await makeCustomer(walletBalance);
    const invoice = await sales.create({
      location_id: locationId,
      customer_id: customer.id,
      items: [{ sku_id: sku.id, quantity: qty }],
      payments: [{ payment_method: 'Cash', amount: 100 * qty }],
    } as never);
    return { customer, invoice: invoice! };
  }

  it('processes a normal return: restocks and settles in cash', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const { invoice } = await makeSaleWithCustomer(sku, 2);
    const item = invoice.sales_invoice_items[0];

    const result = await returns.create({
      original_invoice_id: invoice.id,
      reason: 'Damaged',
      settlement_method: 'Cash',
      items: [{ original_invoice_item_id: item.id, quantity: 1 }],
    } as never);

    expect(result!.return_no).toMatch(/^RET-\d{5}-\d{2}-\d{2}$/);
    expect(Number(result!.settlement_amount)).toBe(100);

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(9); // 10 - 2 sold + 1 returned
  }, 20000);

  it('credits the customer wallet atomically on Wallet settlement', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const { customer, invoice } = await makeSaleWithCustomer(sku, 1, 20);
    const item = invoice.sales_invoice_items[0];

    await returns.create({
      original_invoice_id: invoice.id,
      reason: 'Wrong size',
      settlement_method: 'Wallet',
      items: [{ original_invoice_item_id: item.id, quantity: 1 }],
    } as never);

    const wallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(wallet?.balance)).toBe(120);
  }, 20000);

  it('rejects a return exceeding the invoiced quantity and leaves no partial rows', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const { invoice } = await makeSaleWithCustomer(sku, 1);
    const item = invoice.sales_invoice_items[0];

    await expect(
      returns.create({
        original_invoice_id: invoice.id,
        reason: 'Damaged',
        settlement_method: 'Cash',
        items: [{ original_invoice_item_id: item.id, quantity: 5 }],
      } as never),
    ).rejects.toThrow();

    const stock = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: sku.id, location_id: locationId } },
    });
    expect(stock?.quantity).toBe(9); // unchanged: 10 - 1 sold

    const returnRows = await prisma.sales_returns.findMany({
      where: { original_invoice_id: invoice.id },
    });
    expect(returnRows).toHaveLength(0);
  }, 20000);

  it('enforces the cumulative return limit across sequential partial returns', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const { invoice } = await makeSaleWithCustomer(sku, 2);
    const item = invoice.sales_invoice_items[0];

    await returns.create({
      original_invoice_id: invoice.id,
      reason: 'Partial 1',
      settlement_method: 'Cash',
      items: [{ original_invoice_item_id: item.id, quantity: 1 }],
    } as never);

    // Only 1 remains returnable; requesting 2 more must fail.
    await expect(
      returns.create({
        original_invoice_id: invoice.id,
        reason: 'Partial 2',
        settlement_method: 'Cash',
        items: [{ original_invoice_item_id: item.id, quantity: 2 }],
      } as never),
    ).rejects.toThrow();

    // The remaining 1 unit is still returnable.
    const finalReturn = await returns.create({
      original_invoice_id: invoice.id,
      reason: 'Partial 3',
      settlement_method: 'Cash',
      items: [{ original_invoice_item_id: item.id, quantity: 1 }],
    } as never);
    expect(finalReturn).toBeTruthy();
  }, 20000);

  it('serializes concurrent returns against the same invoice line without over-returning', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const { invoice } = await makeSaleWithCustomer(sku, 2);
    const item = invoice.sales_invoice_items[0];

    const attempt = (reason: string) =>
      returns.create({
        original_invoice_id: invoice.id,
        reason,
        settlement_method: 'Cash',
        items: [{ original_invoice_item_id: item.id, quantity: 2 }],
      } as never);

    const results = await Promise.allSettled([attempt('A'), attempt('B')]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Invoiced qty is 2; two concurrent requests for 2 each can never both succeed.
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  }, 20000);

  it('allocates unique sequential return numbers under concurrent creation', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 20 });

    const sales_ = await Promise.all(
      Array.from({ length: 5 }).map(async (_, i) => {
        // Sequential customer creation avoids a phone-uniqueness collision
        // from parallel Date.now() calls landing in the same millisecond;
        // the returns themselves below still run concurrently.
        await new Promise((r) => setTimeout(r, i * 5));
        return makeSaleWithCustomer(sku, 1);
      }),
    );

    const results = await Promise.all(
      sales_.map(({ invoice }) =>
        returns.create({
          original_invoice_id: invoice.id,
          reason: 'Concurrent',
          settlement_method: 'Cash',
          items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
        } as never),
      ),
    );

    const returnNumbers = results.map((r) => r!.return_no);
    expect(new Set(returnNumbers).size).toBe(5);
  }, 30000);
});
