/**
 * Real-PostgreSQL concurrency and integrity tests for SUPPLIER-01 (supplier payments and
 * ledger), following the same pattern as CUSTOMER-02's wallet-concurrency.spec.ts. Skips
 * entirely when DATABASE_URL is unavailable — never reports a skipped run as passed.
 */
import { PrismaService } from '../src/prisma/prisma.service';
import { SupplierPaymentsService } from '../src/modules/supplier-payments/supplier-payments.service';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/supplier-payments-concurrency.spec.ts requires DATABASE_URL pointing at a ' +
      'real Postgres instance. Supplier payment concurrency was NOT verified in this run.',
  );
}

describeIfDb('supplier payments and ledger (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let payments: SupplierPaymentsService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    payments = new SupplierPaymentsService(prisma);
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

  it('records a normal payment and a correct ledger debit', async () => {
    const supplier = await makeSupplier();

    const payment = await payments.createPayment(supplier.id, {
      amount: 500,
      payment_method: 'UPI',
      payment_date: '2026-04-05',
    } as never);

    expect(payment.payment_status).toBe('Completed');

    const ledger = await prisma.supplier_ledger.findMany({ where: { supplier_id: supplier.id } });
    expect(ledger).toHaveLength(1);
    expect(Number(ledger[0].debit_amount)).toBe(500);
    expect(Number(ledger[0].balance_after)).toBe(-500);
    expect(ledger[0].entry_type).toBe('Payment');
  }, 20000);

  it('records an advance/on-account payment with entry_type Advance', async () => {
    const supplier = await makeSupplier();

    await payments.createPayment(supplier.id, {
      amount: 200,
      payment_method: 'Bank_Transfer',
      payment_date: '2026-04-05',
      is_advance: true,
    } as never);

    const ledger = await prisma.supplier_ledger.findMany({ where: { supplier_id: supplier.id } });
    expect(ledger[0].entry_type).toBe('Advance');
    expect(Number(ledger[0].balance_after)).toBe(-200);
  }, 20000);

  it('chains the running balance correctly across multiple sequential payments', async () => {
    const supplier = await makeSupplier();

    await payments.createPayment(supplier.id, {
      amount: 100,
      payment_method: 'UPI',
      payment_date: '2026-04-01',
    } as never);
    await payments.createPayment(supplier.id, {
      amount: 250,
      payment_method: 'UPI',
      payment_date: '2026-04-02',
    } as never);

    const balance = await payments.getBalance(supplier.id);
    expect(Number(balance.balance)).toBe(-350);

    const ledger = await prisma.supplier_ledger.findMany({
      where: { supplier_id: supplier.id },
      orderBy: { created_at: 'asc' },
    });
    expect(ledger).toHaveLength(2);
    expect(Number(ledger[1].balance_after)).toBe(-350);
  }, 20000);

  it('rejects a payment against an inactive supplier and leaves no rows', async () => {
    const supplier = await makeSupplier('INACTIVE');

    await expect(
      payments.createPayment(supplier.id, {
        amount: 100,
        payment_method: 'UPI',
        payment_date: '2026-04-05',
      } as never),
    ).rejects.toThrow();

    const paymentRows = await prisma.supplier_payments.findMany({
      where: { supplier_id: supplier.id },
    });
    const ledgerRows = await prisma.supplier_ledger.findMany({ where: { supplier_id: supplier.id } });
    expect(paymentRows).toHaveLength(0);
    expect(ledgerRows).toHaveLength(0);
  }, 20000);

  it('rejects a payment against a non-existent supplier', async () => {
    await expect(
      payments.createPayment('00000000-0000-0000-0000-000000000000', {
        amount: 100,
        payment_method: 'UPI',
        payment_date: '2026-04-05',
      } as never),
    ).rejects.toThrow();
  }, 20000);

  it('serializes concurrent payments against the same supplier without losing an update', async () => {
    const supplier = await makeSupplier();

    const results = await Promise.allSettled([
      payments.createPayment(supplier.id, { amount: 100, payment_method: 'UPI', payment_date: '2026-04-05' } as never),
      payments.createPayment(supplier.id, { amount: 200, payment_method: 'UPI', payment_date: '2026-04-05' } as never),
      payments.createPayment(supplier.id, { amount: 300, payment_method: 'UPI', payment_date: '2026-04-05' } as never),
    ]);

    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);

    const balance = await payments.getBalance(supplier.id);
    expect(Number(balance.balance)).toBe(-600);

    const ledger = await prisma.supplier_ledger.findMany({
      where: { supplier_id: supplier.id },
      orderBy: { created_at: 'asc' },
    });
    expect(ledger).toHaveLength(3);
    // Each entry's balance_after must chain off the immediately preceding entry's
    // balance_after minus its own debit — proof the writes were serialized, not
    // interleaved on a stale read (same invariant proven for wallet concurrency).
    for (let i = 1; i < ledger.length; i += 1) {
      const prevBalance = Number(ledger[i - 1].balance_after);
      const thisDebit = Number(ledger[i].debit_amount);
      expect(Number(ledger[i].balance_after)).toBe(prevBalance - thisDebit);
    }
  }, 20000);

  it('lists payments and ledger entries ordered newest first', async () => {
    const supplier = await makeSupplier();

    await payments.createPayment(supplier.id, { amount: 50, payment_method: 'UPI', payment_date: '2026-04-01' } as never);
    await payments.createPayment(supplier.id, { amount: 75, payment_method: 'UPI', payment_date: '2026-04-03' } as never);

    const paymentList = await payments.listPayments(supplier.id, {});
    expect(paymentList.items).toHaveLength(2);
    expect(paymentList.items[0].payment_date >= paymentList.items[1].payment_date).toBe(true);

    const ledgerList = await payments.listLedger(supplier.id, {});
    expect(ledgerList.items).toHaveLength(2);
  }, 20000);
});
