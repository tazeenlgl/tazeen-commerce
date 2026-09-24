import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';

@Injectable()
export class SupplierPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(supplierId: string, dto: CreateSupplierPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      // Row-level lock on the supplier: serializes concurrent payments so
      // the "read latest running balance, compute next" step below can
      // never see a stale balance_after from a payment that is still
      // in-flight in another transaction — the same technique proven for
      // inventory_stock/customer_wallets elsewhere in this codebase.
      await tx.$queryRaw`SELECT id FROM suppliers WHERE id = ${supplierId}::uuid FOR UPDATE`;

      const supplier = await tx.supplier.findUnique({
        where: { id: supplierId },
        select: { id: true, status: true },
      });

      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }

      if (String(supplier.status) !== 'ACTIVE') {
        throw new BadRequestException('Supplier is inactive');
      }

      const lastEntry = await tx.supplier_ledger.findFirst({
        where: { supplier_id: supplierId },
        orderBy: { created_at: 'desc' },
        select: { balance_after: true },
      });

      const currentBalance = lastEntry
        ? new Prisma.Decimal(lastEntry.balance_after)
        : new Prisma.Decimal(0);

      const amount = new Prisma.Decimal(dto.amount);

      // Accounts-payable convention: Purchase_Invoice credits (increases)
      // the amount owed to the supplier; a Payment or Advance debits
      // (reduces) it. balance_after is the running amount we owe the
      // supplier and can go negative when the supplier has been prepaid.
      const balanceAfter = currentBalance.minus(amount);

      const paymentDate = new Date(`${dto.payment_date}T00:00:00.000Z`);

      if (Number.isNaN(paymentDate.getTime())) {
        throw new BadRequestException('payment_date must be a valid date');
      }

      const payment = await tx.supplier_payments.create({
        data: {
          supplier_id: supplierId,
          amount,
          payment_method: dto.payment_method,
          payment_status: 'Completed',
          payment_date: paymentDate,
          reference_number: dto.reference_number ?? null,
          notes: dto.notes ?? null,
          updated_at: new Date(),
        },
      });

      await tx.supplier_ledger.create({
        data: {
          supplier_id: supplierId,
          entry_type: dto.is_advance ? 'Advance' : 'Payment',
          reference_type: 'supplier_payment',
          reference_id: payment.id,
          debit_amount: amount,
          credit_amount: new Prisma.Decimal(0),
          balance_after: balanceAfter,
          notes: dto.notes ?? null,
        },
      });

      return payment;
    });
  }

  async listPayments(supplierId: string, params: { page?: number; limit?: number }) {
    await this.ensureSupplierExists(supplierId);

    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where: Prisma.supplier_paymentsWhereInput = { supplier_id: supplierId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.supplier_payments.findMany({
        where,
        orderBy: [{ payment_date: 'desc' }, { created_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.supplier_payments.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async listLedger(supplierId: string, params: { page?: number; limit?: number }) {
    await this.ensureSupplierExists(supplierId);

    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where: Prisma.supplier_ledgerWhereInput = { supplier_id: supplierId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.supplier_ledger.findMany({
        where,
        orderBy: [{ created_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.supplier_ledger.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async getBalance(supplierId: string) {
    await this.ensureSupplierExists(supplierId);

    const lastEntry = await this.prisma.supplier_ledger.findFirst({
      where: { supplier_id: supplierId },
      orderBy: { created_at: 'desc' },
      select: { balance_after: true },
    });

    return { supplier_id: supplierId, balance: lastEntry?.balance_after ?? new Prisma.Decimal(0) };
  }

  private async ensureSupplierExists(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
  }
}
