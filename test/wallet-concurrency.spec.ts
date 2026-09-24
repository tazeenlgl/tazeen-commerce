/**
 * Real-PostgreSQL concurrency tests for wallet credit/debit, following the same pattern as
 * INVENTORY-01's inventory-concurrency.spec.ts. Skips entirely when DATABASE_URL is
 * unavailable — never reports a skipped run as passed.
 */
import { PrismaService } from '../src/prisma/prisma.service';
import { WalletService } from '../src/modules/wallet/wallet.service';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/wallet-concurrency.spec.ts requires DATABASE_URL pointing at a real ' +
      'Postgres instance. Wallet concurrency was NOT verified in this run.',
  );
}

describeIfDb('customer wallet concurrency (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let wallet: WalletService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    wallet = new WalletService(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function makeCustomerWithWallet(seq: number, startingBalance = 0) {
    const customer = await prisma.customers.create({
      data: {
        customer_id: `W${Date.now().toString(36)}${seq}`.slice(0, 20),
        phone: `9${String(Date.now()).slice(-9)}`.slice(0, 10),
        status: 'Active',
      },
    });
    const w = await prisma.customer_wallets.create({
      data: { customer_id: customer.id, balance: startingBalance },
    });
    return { customer, wallet: w };
  }

  it('two concurrent credits do not lose an update', async () => {
    const { customer } = await makeCustomerWithWallet(1, 0);

    const [a, b] = await Promise.allSettled([
      wallet.credit(customer.id, { amount: 100 } as never),
      wallet.credit(customer.id, { amount: 50 } as never),
    ]);

    expect(a.status).toBe('fulfilled');
    expect(b.status).toBe('fulfilled');

    const finalWallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(finalWallet?.balance)).toBe(150);

    const txs = await prisma.customer_wallet_transactions.findMany({ where: { wallet_id: finalWallet!.id } });
    expect(txs).toHaveLength(2);
  }, 20000);

  it('concurrent credit and debit settle to the correct final balance', async () => {
    const { customer } = await makeCustomerWithWallet(2, 100);

    const [creditResult, debitResult] = await Promise.allSettled([
      wallet.credit(customer.id, { amount: 40 } as never),
      wallet.debit(customer.id, { amount: 30 } as never),
    ]);

    expect(creditResult.status).toBe('fulfilled');
    expect(debitResult.status).toBe('fulfilled');

    const finalWallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    // 100 + 40 - 30 = 110, regardless of which of the two ran first.
    expect(Number(finalWallet?.balance)).toBe(110);

    const txs = await prisma.customer_wallet_transactions.findMany({
      where: { wallet_id: finalWallet!.id },
      orderBy: { created_at: 'asc' },
    });
    expect(txs).toHaveLength(2);
    // Each entry's balance_before must chain off the immediately preceding entry's
    // balance_after — proof the two writes were serialized, not interleaved on stale reads.
    expect(Number(txs[1].balance_before)).toBe(Number(txs[0].balance_after));
  }, 20000);

  it('concurrent debits can never drive the balance negative', async () => {
    const { customer } = await makeCustomerWithWallet(3, 50);

    const results = await Promise.allSettled([
      wallet.debit(customer.id, { amount: 40 } as never),
      wallet.debit(customer.id, { amount: 40 } as never),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Both debiting 40 from a balance of 50 can never both succeed (50 - 40 - 40 = -30).
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const finalWallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(finalWallet?.balance)).toBeGreaterThanOrEqual(0);
    expect(Number(finalWallet?.balance)).toBe(10);
  }, 20000);

  it('a rejected debit leaves both balance and ledger untouched (no partial write)', async () => {
    const { customer } = await makeCustomerWithWallet(4, 10);

    await expect(wallet.debit(customer.id, { amount: 100 } as never)).rejects.toThrow();

    const finalWallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(finalWallet?.balance)).toBe(10);

    const txs = await prisma.customer_wallet_transactions.findMany({ where: { wallet_id: finalWallet!.id } });
    expect(txs).toHaveLength(0);
  }, 20000);

  it('three concurrent credits on the same wallet all land (no lost updates under higher contention)', async () => {
    const { customer } = await makeCustomerWithWallet(5, 0);

    const results = await Promise.allSettled([
      wallet.credit(customer.id, { amount: 10 } as never),
      wallet.credit(customer.id, { amount: 20 } as never),
      wallet.credit(customer.id, { amount: 30 } as never),
    ]);

    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);

    const finalWallet = await prisma.customer_wallets.findUnique({ where: { customer_id: customer.id } });
    expect(Number(finalWallet?.balance)).toBe(60);

    const txs = await prisma.customer_wallet_transactions.findMany({ where: { wallet_id: finalWallet!.id } });
    expect(txs).toHaveLength(3);
  }, 20000);
});
