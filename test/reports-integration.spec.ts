/**
 * Real-PostgreSQL integration tests for REPORTING-GST-01. Aggregation correctness must be
 * verified against actual persisted transactions, not mocked. Skips entirely when
 * DATABASE_URL is unavailable — never reports a skipped run as passed. Read-only module:
 * no concurrency tests are needed.
 */
import { PrismaService } from '../src/prisma/prisma.service';
import { SalesService } from '../src/modules/sales/sales.service';
import { SalesReturnsService } from '../src/modules/sales-returns/sales-returns.service';
import { SalesExchangesService } from '../src/modules/sales-exchanges/sales-exchanges.service';
import { ReportsService } from '../src/modules/reports/reports.service';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/reports-integration.spec.ts requires DATABASE_URL pointing at a real ' +
      'Postgres instance. Reporting aggregation was NOT verified in this run.',
  );
}

describeIfDb('sales register and GST summary (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let sales: SalesService;
  let returns: SalesReturnsService;
  let exchanges: SalesExchangesService;
  let reports: ReportsService;
  let locationA: string;
  let locationB: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    sales = new SalesService(prisma);
    returns = new SalesReturnsService(prisma);
    exchanges = new SalesExchangesService(prisma);
    reports = new ReportsService(prisma);

    const locA = await prisma.locations.create({
      data: {
        location_code: `RPTA${Date.now().toString(36)}`.slice(0, 50),
        location_name: 'Report Test Store A',
        location_type: 'Retail_Store',
        status: 'Active',
      },
    });
    locationA = locA.id;

    const locB = await prisma.locations.create({
      data: {
        location_code: `RPTB${Date.now().toString(36)}`.slice(0, 50),
        location_name: 'Report Test Store B',
        location_type: 'Retail_Store',
        status: 'Active',
      },
    });
    locationB = locB.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function makeSku(opts: { mrp: number; gstRate: number; stock: number; locationId: string }) {
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
        gst_rate: opts.gstRate,
        purchase_rate: opts.mrp,
        status: 'Active',
      },
    });
    const sku = await prisma.product_skus.create({
      data: { product_id: product.id, sku: `SKU${suffix}`.slice(0, 50), sequence_no: 1, mrp: opts.mrp, status: 'Active' },
    });
    await prisma.inventory_stock.create({
      data: { sku_id: sku.id, location_id: opts.locationId, quantity: opts.stock },
    });
    return sku;
  }

  async function makeSale(locationId: string, sku: { id: string; mrp: any }, qty: number, invoiceDate: Date) {
    const invoice = await sales.create({
      location_id: locationId,
      items: [{ sku_id: sku.id, quantity: qty }],
      payments: [{ payment_method: 'Cash', amount: Number(sku.mrp) * qty }],
    } as never);
    // Backdate invoice_date directly (SalesService always stamps "now").
    await prisma.sales_invoices.update({
      where: { id: invoice!.id },
      data: { invoice_date: invoiceDate },
    });
    return invoice!;
  }

  it('reports a normal sale with correct GST split (18% intra-state)', async () => {
    const sku = await makeSku({ mrp: 118, gstRate: 18, stock: 10, locationId: locationA });
    const day = new Date('2026-05-10T10:00:00.000Z');
    const invoice = await makeSale(locationA, sku, 1, day);

    const register = await reports.salesRegister({ fromDate: '2026-05-10', toDate: '2026-05-10', locationId: locationA });
    const row = register.items.find((r) => r.reference_no === invoice.invoice_no);

    expect(row).toBeTruthy();
    expect(row!.row_type).toBe('Sale');
    expect(Number(row!.total_value)).toBe(118);
    expect(Number(row!.gst_amount)).toBeCloseTo(18, 2);
    expect(Number(row!.cgst_amount)).toBeCloseTo(9, 2);
    expect(Number(row!.sgst_amount)).toBeCloseTo(9, 2);

    const summary = await reports.gstSummary({ fromDate: '2026-05-10', toDate: '2026-05-10', locationId: locationA });
    const rateGroup = summary.by_gst_rate.find((g) => Number(g.gst_rate) === 18);
    expect(rateGroup).toBeTruthy();
    expect(Number(rateGroup!.gross_taxable_value)).toBeCloseTo(100, 2);
    expect(Number(rateGroup!.gross_gst_amount)).toBeCloseTo(18, 2);
  }, 20000);

  it('excludes transactions outside the requested date range', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10, locationId: locationA });
    await makeSale(locationA, sku, 1, new Date('2026-06-01T10:00:00.000Z'));

    const register = await reports.salesRegister({ fromDate: '2026-06-02', toDate: '2026-06-30', locationId: locationA });
    expect(register.items).toHaveLength(0);
    expect(register.pagination.total).toBe(0);

    const summary = await reports.gstSummary({ fromDate: '2026-06-02', toDate: '2026-06-30', locationId: locationA });
    expect(Number(summary.totals.net_sales)).toBe(0);
  }, 20000);

  it('filters by location', async () => {
    const skuA = await makeSku({ mrp: 100, gstRate: 0, stock: 10, locationId: locationA });
    const skuB = await makeSku({ mrp: 200, gstRate: 0, stock: 10, locationId: locationB });
    const day = new Date('2026-06-05T10:00:00.000Z');
    await makeSale(locationA, skuA, 1, day);
    await makeSale(locationB, skuB, 1, day);

    const registerA = await reports.salesRegister({ fromDate: '2026-06-05', toDate: '2026-06-05', locationId: locationA });
    expect(registerA.items.every((r) => r.location_id === locationA)).toBe(true);

    const summaryB = await reports.gstSummary({ fromDate: '2026-06-05', toDate: '2026-06-05', locationId: locationB });
    expect(Number(summaryB.totals.gross_taxable_value)).toBe(200);
  }, 20000);

  it('filters by gst_rate and aggregates multiple rates separately', async () => {
    const skuLow = await makeSku({ mrp: 105, gstRate: 5, stock: 10, locationId: locationA });
    const skuHigh = await makeSku({ mrp: 112, gstRate: 12, stock: 10, locationId: locationA });
    const day = new Date('2026-06-10T10:00:00.000Z');
    await makeSale(locationA, skuLow, 1, day);
    await makeSale(locationA, skuHigh, 1, day);

    const summary = await reports.gstSummary({ fromDate: '2026-06-10', toDate: '2026-06-10', locationId: locationA });
    const rates = summary.by_gst_rate.map((g) => Number(g.gst_rate)).sort();
    expect(rates).toEqual(expect.arrayContaining([5, 12]));

    const filtered = await reports.salesRegister({
      fromDate: '2026-06-10',
      toDate: '2026-06-10',
      locationId: locationA,
      gstRate: 5,
    });
    expect(filtered.items.every((r) => Number(r.gst_rate) === 5)).toBe(true);
  }, 20000);

  it('reports sales returns as separate negative rows and reconciles gross/return/net', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10, locationId: locationA });
    const day = new Date('2026-06-15T10:00:00.000Z');
    const invoice = await makeSale(locationA, sku, 2, day);

    const returnResult = await returns.create({
      original_invoice_id: invoice.id,
      reason: 'Damaged',
      settlement_method: 'Cash',
      items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
    } as never);
    await prisma.sales_returns.update({ where: { id: returnResult!.id }, data: { return_date: day } });

    const register = await reports.salesRegister({ fromDate: '2026-06-15', toDate: '2026-06-15', locationId: locationA });
    const saleRow = register.items.find((r) => r.row_type === 'Sale' && r.reference_no === invoice.invoice_no);
    const returnRow = register.items.find((r) => r.row_type === 'Return' && r.reference_no === returnResult!.return_no);

    expect(saleRow).toBeTruthy();
    expect(Number(saleRow!.total_value)).toBe(200);
    expect(returnRow).toBeTruthy();
    expect(Number(returnRow!.total_value)).toBe(-100); // negative row, half the sale
    expect(returnRow!.quantity).toBe(-1);

    const summary = await reports.gstSummary({ fromDate: '2026-06-15', toDate: '2026-06-15', locationId: locationA });
    const group = summary.by_gst_rate.find((g) => Number(g.gst_rate) === 0);
    expect(Number(group!.gross_taxable_value)).toBe(200);
    expect(Number(group!.return_taxable_value)).toBe(100);
    expect(Number(group!.net_taxable_value)).toBe(100);
    // gross - return = net, exactly.
    expect(Number(group!.gross_taxable_value) - Number(group!.return_taxable_value)).toBe(
      Number(group!.net_taxable_value),
    );
  }, 20000);

  it('excludes cancelled sales invoices', async () => {
    const sku = await makeSku({ mrp: 100, gstRate: 0, stock: 10, locationId: locationA });
    const day = new Date('2026-06-20T10:00:00.000Z');
    const invoice = await makeSale(locationA, sku, 1, day);
    await prisma.sales_invoices.update({ where: { id: invoice.id }, data: { status: 'Cancelled' } });

    const register = await reports.salesRegister({ fromDate: '2026-06-20', toDate: '2026-06-20', locationId: locationA });
    expect(register.items.find((r) => r.reference_no === invoice.invoice_no)).toBeUndefined();

    const summary = await reports.gstSummary({ fromDate: '2026-06-20', toDate: '2026-06-20', locationId: locationA });
    expect(Number(summary.totals.gross_taxable_value)).toBe(0);
  }, 20000);

  it('excludes exchange transactions entirely (no GST breakdown available for replacement leg)', async () => {
    const skuOriginal = await makeSku({ mrp: 100, gstRate: 0, stock: 10, locationId: locationA });
    const skuReplacement = await makeSku({ mrp: 100, gstRate: 0, stock: 10, locationId: locationA });
    const day = new Date('2026-06-25T10:00:00.000Z');
    const invoice = await makeSale(locationA, skuOriginal, 1, day);

    const exchangeResult = await exchanges.create({
      original_invoice_id: invoice.id,
      reason: 'Same value swap',
      original_items: [{ original_invoice_item_id: invoice.sales_invoice_items[0].id, quantity: 1 }],
      replacement_items: [{ sku_id: skuReplacement.id, quantity: 1 }],
    } as never);
    await prisma.sales_returns.update({ where: { id: exchangeResult!.id }, data: { return_date: day } });

    const register = await reports.salesRegister({ fromDate: '2026-06-25', toDate: '2026-06-25', locationId: locationA });
    // Only the original sale appears; the exchange (return_type='Exchange') contributes no row.
    expect(register.items).toHaveLength(1);
    expect(register.items[0].reference_no).toBe(invoice.invoice_no);
    expect(register.items.find((r) => r.reference_no === exchangeResult!.return_no)).toBeUndefined();
  }, 20000);

  it('returns an empty, zeroed result for a period with no transactions', async () => {
    const register = await reports.salesRegister({ fromDate: '2020-01-01', toDate: '2020-01-31' });
    expect(register.items).toHaveLength(0);
    expect(register.pagination.total).toBe(0);

    const summary = await reports.gstSummary({ fromDate: '2020-01-01', toDate: '2020-01-31' });
    expect(summary.by_gst_rate).toHaveLength(0);
    expect(Number(summary.totals.net_sales)).toBe(0);
    expect(Number(summary.totals.net_taxable_value)).toBe(0);
  }, 20000);

  it('paginates the sales register with deterministic ordering', async () => {
    const sku = await makeSku({ mrp: 50, gstRate: 0, stock: 20, locationId: locationA });
    const day = new Date('2026-07-01T10:00:00.000Z');
    for (let i = 0; i < 5; i += 1) {
      await makeSale(locationA, sku, 1, day);
    }

    const page1 = await reports.salesRegister({ fromDate: '2026-07-01', toDate: '2026-07-01', locationId: locationA, page: 1, limit: 2 });
    const page2 = await reports.salesRegister({ fromDate: '2026-07-01', toDate: '2026-07-01', locationId: locationA, page: 2, limit: 2 });

    expect(page1.items).toHaveLength(2);
    expect(page2.items).toHaveLength(2);
    expect(page1.pagination.total).toBeGreaterThanOrEqual(5);
    // No overlap between pages.
    const page1Refs = page1.items.map((r) => r.reference_no);
    const page2Refs = page2.items.map((r) => r.reference_no);
    expect(page1Refs.some((r) => page2Refs.includes(r))).toBe(false);

    // Re-running the same page returns the same rows in the same order.
    const page1Again = await reports.salesRegister({ fromDate: '2026-07-01', toDate: '2026-07-01', locationId: locationA, page: 1, limit: 2 });
    expect(page1Again.items.map((r) => r.reference_no)).toEqual(page1Refs);
  }, 20000);

  it('rejects an invalid date range via the controller-level validation', async () => {
    await expect(
      reports.salesRegister({ fromDate: '2026-07-10', toDate: '2026-07-01' }),
    ).rejects.toThrow();
  });
});
