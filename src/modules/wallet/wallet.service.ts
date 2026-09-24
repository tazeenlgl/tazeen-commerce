import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';

type LedgerType = 'Manual_Credit' | 'Manual_Debit';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(customerId: string) {
    const wallet = await this.prisma.customer_wallets.findUnique({
      where: { customer_id: customerId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this customer');
    }

    return wallet;
  }

  async listTransactions(customerId: string) {
    const wallet = await this.getBalance(customerId);

    return this.prisma.customer_wallet_transactions.findMany({
      where: { wallet_id: wallet.id },
      orderBy: [{ created_at: 'desc' }],
    });
  }

  async credit(customerId: string, dto: WalletTransactionDto) {
    return this.applyDelta(customerId, dto, 'Manual_Credit', new Prisma.Decimal(dto.amount));
  }

  async debit(customerId: string, dto: WalletTransactionDto) {
    return this.applyDelta(customerId, dto, 'Manual_Debit', new Prisma.Decimal(dto.amount).negated());
  }

  /**
   * Applies a signed delta to the wallet balance and records the ledger entry atomically.
   *
   * The balance UPDATE is a single statement whose WHERE clause both selects the row and
   * enforces the non-negative-balance rule in the same atomic step, taking Postgres's own
   * row lock for its duration — the same technique proven for inventory_stock in
   * INVENTORY-01. Two concurrent credit/debit calls on the same wallet can never both read
   * the same "before" balance and lose one of the deltas, and a debit that would overdraw
   * the wallet is rejected by the database itself rather than by an app-level read-then-check.
   */
  private async applyDelta(
    customerId: string,
    dto: WalletTransactionDto,
    type: LedgerType,
    delta: Prisma.Decimal,
  ) {
    // Confirms the customer/wallet exists first so a genuinely missing wallet reports 404,
    // not the same 409 used for "insufficient balance" below.
    await this.getBalance(customerId);

    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string; balance: Prisma.Decimal }[]>`
        UPDATE customer_wallets
        SET balance = balance + ${delta}, updated_at = now()
        WHERE customer_id = ${customerId}::uuid AND balance + ${delta} >= 0
        RETURNING id, balance
      `;

      if (rows.length === 0) {
        throw new ConflictException('Wallet balance cannot become negative');
      }

      const { id: walletId, balance: balanceAfter } = rows[0];
      const balanceBefore = balanceAfter.minus(delta);

      const transaction = await tx.customer_wallet_transactions.create({
        data: {
          wallet_id: walletId,
          transaction_type: type,
          reference_type: dto.reference_type ?? null,
          reference_id: dto.reference_id ?? null,
          amount: delta.abs(),
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          reason: dto.reason ?? null,
        },
      });

      return { balance: balanceAfter, transaction };
    });
  }
}
