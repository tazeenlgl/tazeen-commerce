/**
 * Real-PostgreSQL concurrency and integrity tests for SALES-03 (sales exchanges), following
 * the same pattern as SALES-01/SALES-02. Skips entirely when DATABASE_URL is unavailable —
 * never reports a skipped run as passed.
 */
import { PrismaService } from '../src/prisma/prisma.service';
import { SalesService } from '../src/modules/sales/sales.service';
import { SalesExchangesService } from '../src/modules/sales-exchanges/sales-exchanges.service';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/sales-exchanges-concurrency.spec.ts requires DATABASE_URL pointing at a ' +
      'real Postgres instance. Sales exchange concurrency was NOT verified in this run.',
  );
}

describeIfDb('sales exchanges (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let sales: SalesService;
  let exchanges: SalesExchangesService;
  let locationId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    sales = new SalesService(prisma);
    exchanges = new SalesExchangesService(prisma);

    const location = await prisma.locations.create({
      data: {
        location_code: `EXCTEST${Date.now().toString(36)}`.slice(0, 50),
        location_name: 'Exchange Test Store',
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
        customer_id: `E${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.slice(0, 20),
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

  async function makeSaleWithCustomer(
    skus: { sku: { id: string; mrp: any }; qty: number }[],
    walletBalance?: number,
  ) {
    const customer = await makeCustomer(walletBalance);
    const invoice = await sales.create({
      location_id: locationId,
      customer_id: customer.id,
      items: skus.map((s) => ({ sku_id: s.sku.id, quantity: s.qty })),
      payments: [
        {
          payment_method: 'Cash',
          amount: skus.reduce((sum, s) => sum + s.qty * Number(s.sku.mrp), 0),
        },
      ],
    } as never);
    return { customer, invoice: invoice! };
  }

  it('processes an equal-value exchange with no financial movement', async () => {
    const skuA = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuB = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const { invoice } = await makeSaleWithCustomer([{ sku: skuA, qty: 1 }]);

    const result = await exchanges.create({
      original_invoice_id: invoice.id,
      reason: 'Same value swap',
      original_items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
      replacement_items: [{ sku_id: skuB.id, quantity: 1 }],
    } as never);

    expect(result!.return_no).toMatch(/^EXC-\d{5}-\d{2}-\d{2}$/);
    expect(Number(result!.settlement_amount)).toBe(0);

    const stockA = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: skuA.id, location_id: locationId } },
    });
    const stockB = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: skuB.id, location_id: locationId } },
    });
    expect(stockA?.quantity).toBe(10); // 10 - 1 sold + 1 returned
    expect(stockB?.quantity).toBe(9); // 10 - 1 given as replacement
  }, 20000);

  it('collects a positive difference in Cash without touching the wallet', async () => {
    const skuA = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuB = await makeSku({ mrp: 150, gstRate: 0, stock: 10 });
    const { customer, invoice } = await makeSaleWithCustomer([{ sku: skuA, qty: 1 }], 500);

    const result = await exchanges.create({
      original_invoice_id: invoice.id,
      reason: 'Upgrade',
      settlement_method: 'Cash',
      original_items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
      replacement_items: [{ sku_id: skuB.id, quantity: 1 }],
    } as never);

    expect(Number(result!.settlement_amount)).toBe(50);
    const wallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(wallet?.balance)).toBe(500); // untouched
  }, 20000);

  it('debits the wallet for a positive difference and hard-fails on insufficient balance', async () => {
    const skuA = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuB = await makeSku({ mrp: 150, gstRate: 0, stock: 10 });
    const { customer, invoice } = await makeSaleWithCustomer([{ sku: skuA, qty: 1 }], 10);

    await expect(
      exchanges.create({
        original_invoice_id: invoice.id,
        reason: 'Upgrade, insufficient wallet',
        settlement_method: 'Wallet',
        original_items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
        replacement_items: [{ sku_id: skuB.id, quantity: 1 }],
      } as never),
    ).rejects.toThrow();

    // Whole exchange rolled back: no stock movement, no wallet change, no record.
    const wallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(wallet?.balance)).toBe(10);

    const stockA = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: skuA.id, location_id: locationId } },
    });
    const stockB = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: skuB.id, location_id: locationId } },
    });
    expect(stockA?.quantity).toBe(9); // unchanged: 10 - 1 sold
    expect(stockB?.quantity).toBe(10); // unchanged: no decrement happened

    const exchangeRows = await prisma.sales_returns.findMany({
      where: { original_invoice_id: invoice.id },
    });
    expect(exchangeRows).toHaveLength(0);
  }, 20000);

  it('credits the wallet for a negative difference (refund)', async () => {
    const skuA = await makeSku({ mrp: 150, gstRate: 0, stock: 10 });
    const skuB = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const { customer, invoice } = await makeSaleWithCustomer([{ sku: skuA, qty: 1 }], 500);

    const result = await exchanges.create({
      original_invoice_id: invoice.id,
      reason: 'Downgrade',
      settlement_method: 'Wallet',
      original_items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
      replacement_items: [{ sku_id: skuB.id, quantity: 1 }],
    } as never);

    expect(Number(result!.settlement_amount)).toBe(-50);
    const wallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(wallet?.balance)).toBe(550);
  }, 20000);

  it('handles multiple original lines and multiple replacement lines in one exchange', async () => {
    const skuA1 = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuA2 = await makeSku({ mrp: 50, gstRate: 0, stock: 10 });
    const skuB1 = await makeSku({ mrp: 80, gstRate: 0, stock: 10 });
    const skuB2 = await makeSku({ mrp: 60, gstRate: 0, stock: 10 });

    const { invoice } = await makeSaleWithCustomer([
      { sku: skuA1, qty: 1 },
      { sku: skuA2, qty: 1 },
    ]);

    const result = await exchanges.create({
      original_invoice_id: invoice.id,
      reason: 'Mixed items exchange',
      settlement_method: 'Cash',
      original_items: invoice.sales_invoice_items.map((item: any) => ({
        original_invoice_item_id: item.id,
        quantity: item.quantity,
      })),
      replacement_items: [
        { sku_id: skuB1.id, quantity: 1 },
        { sku_id: skuB2.id, quantity: 1 },
      ],
    } as never);

    expect(Number(result!.original_value)).toBe(150);
    expect(Number(result!.replacement_value)).toBe(140);
    expect(Number(result!.settlement_amount)).toBe(-10);
    expect(result!.sales_return_items).toHaveLength(2);
    expect(result!.exchange_replacement_items).toHaveLength(2);
  }, 20000);

  it('rejects an exchange requesting more replacement stock than available', async () => {
    const skuA = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuB = await makeSku({ mrp: 100, gstRate: 0, stock: 1 });
    const { invoice } = await makeSaleWithCustomer([{ sku: skuA, qty: 1 }]);

    await expect(
      exchanges.create({
        original_invoice_id: invoice.id,
        reason: 'Insufficient replacement stock',
        original_items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
        replacement_items: [{ sku_id: skuB.id, quantity: 5 }],
      } as never),
    ).rejects.toThrow();

    const stockA = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: skuA.id, location_id: locationId } },
    });
    expect(stockA?.quantity).toBe(9); // restock must not have happened either — full rollback
  }, 20000);

  it('enforces the cumulative return/exchange limit against the same original line', async () => {
    const skuA = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuB = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const { invoice } = await makeSaleWithCustomer([{ sku: skuA, qty: 1 }]);
    const item = invoice.sales_invoice_items[0];

    await exchanges.create({
      original_invoice_id: invoice.id,
      reason: 'First exchange',
      original_items: [{ original_invoice_item_id: item.id, quantity: 1 }],
      replacement_items: [{ sku_id: skuB.id, quantity: 1 }],
    } as never);

    // Invoiced qty (1) already fully exchanged; a second attempt on the same line must fail.
    await expect(
      exchanges.create({
        original_invoice_id: invoice.id,
        reason: 'Second exchange, over limit',
        original_items: [{ original_invoice_item_id: item.id, quantity: 1 }],
        replacement_items: [{ sku_id: skuB.id, quantity: 1 }],
      } as never),
    ).rejects.toThrow();
  }, 20000);

  it('serializes concurrent exchanges against the same original line', async () => {
    const skuA = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuB = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const { invoice } = await makeSaleWithCustomer([{ sku: skuA, qty: 2 }]);
    const item = invoice.sales_invoice_items[0];

    const attempt = (reason: string) =>
      exchanges.create({
        original_invoice_id: invoice.id,
        reason,
        original_items: [{ original_invoice_item_id: item.id, quantity: 2 }],
        replacement_items: [{ sku_id: skuB.id, quantity: 2 }],
      } as never);

    const results = await Promise.allSettled([attempt('A'), attempt('B')]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Invoiced qty is 2; two concurrent requests for 2 each can never both succeed.
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  }, 20000);

  it('serializes concurrent exchanges contending for the same replacement stock', async () => {
    const skuA1 = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuA2 = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
    const skuB = await makeSku({ mrp: 100, gstRate: 0, stock: 3 });

    const { invoice: invoice1 } = await makeSaleWithCustomer([{ sku: skuA1, qty: 1 }]);
    const { invoice: invoice2 } = await makeSaleWithCustomer([{ sku: skuA2, qty: 1 }]);

    const attempt = (invoice: any) =>
      exchanges.create({
        original_invoice_id: invoice.id,
        reason: 'Replacement stock contention',
        settlement_method: 'Cash',
        original_items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
        replacement_items: [{ sku_id: skuB.id, quantity: 2 }],
      } as never);

    const results = await Promise.allSettled([attempt(invoice1), attempt(invoice2)]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Stock is 3; two requests for 2 each can never both succeed.
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const stockB = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: skuB.id, location_id: locationId } },
    });
    expect(stockB?.quantity).toBeGreaterThanOrEqual(0);
    expect(stockB?.quantity).toBe(1);
  }, 20000);

  it('allocates unique sequential exchange numbers under concurrent creation', async () => {
    const skuB = await makeSku({ mrp: 100, gstRate: 0, stock: 20 });

    const setups = [];
    for (let i = 0; i < 5; i += 1) {
      // Sequential setup avoids a phone-uniqueness collision from parallel
      // Date.now() calls; the exchanges themselves below run concurrently.
      await new Promise((r) => setTimeout(r, i * 5));
      const skuA = await makeSku({ mrp: 100, gstRate: 0, stock: 10 });
      setups.push(await makeSaleWithCustomer([{ sku: skuA, qty: 1 }]));
    }

    const results = await Promise.all(
      setups.map(({ invoice }) =>
        exchanges.create({
          original_invoice_id: invoice.id,
          reason: 'Concurrent numbering',
          original_items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
          replacement_items: [{ sku_id: skuB.id, quantity: 1 }],
        } as never),
      ),
    );

    const exchangeNumbers = results.map((r) => r!.return_no);
    expect(new Set(exchangeNumbers).size).toBe(5);
  }, 30000);
});
