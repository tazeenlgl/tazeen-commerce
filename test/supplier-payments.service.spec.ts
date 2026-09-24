import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SupplierPaymentsService } from '../src/modules/supplier-payments/supplier-payments.service';
import { PrismaService } from '../src/prisma/prisma.service';

function makeTx(overrides: Record<string, any> = {}) {
  return {
    $queryRaw: jest.fn(),
    supplier: { findUnique: jest.fn() },
    supplier_ledger: { findFirst: jest.fn(), create: jest.fn() },
    supplier_payments: { create: jest.fn() },
    ...overrides,
  };
}

function makePrisma(tx: any): PrismaService {
  return { $transaction: (fn: any) => fn(tx) } as unknown as PrismaService;
}

const baseDto = {
  amount: 1000,
  payment_method: 'UPI' as const,
  payment_date: '2026-04-05',
};

describe('SupplierPaymentsService.createPayment — validation guard clauses (mocked Prisma)', () => {
  it('rejects when the supplier does not exist', async () => {
    const tx = makeTx();
    tx.supplier.findUnique.mockResolvedValue(null);
    const service = new SupplierPaymentsService(makePrisma(tx));

    await expect(service.createPayment('sup-1', baseDto as never)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects when the supplier is inactive', async () => {
    const tx = makeTx();
    tx.supplier.findUnique.mockResolvedValue({ id: 'sup-1', status: 'INACTIVE' });
    const service = new SupplierPaymentsService(makePrisma(tx));

    await expect(service.createPayment('sup-1', baseDto as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an invalid payment_date', async () => {
    const tx = makeTx();
    tx.supplier.findUnique.mockResolvedValue({ id: 'sup-1', status: 'ACTIVE' });
    tx.supplier_ledger.findFirst.mockResolvedValue(null);
    const service = new SupplierPaymentsService(makePrisma(tx));

    await expect(
      service.createPayment('sup-1', { ...baseDto, payment_date: 'not-a-date' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('debits the running balance and posts the payment as Completed immediately', async () => {
    const tx = makeTx();
    tx.supplier.findUnique.mockResolvedValue({ id: 'sup-1', status: 'ACTIVE' });
    tx.supplier_ledger.findFirst.mockResolvedValue({ balance_after: 500 });
    tx.supplier_payments.create.mockResolvedValue({ id: 'pay-1' });
    const service = new SupplierPaymentsService(makePrisma(tx));

    await service.createPayment('sup-1', baseDto as never);

    expect(tx.supplier_payments.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ payment_status: 'Completed' }),
      }),
    );
    expect(tx.supplier_ledger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entry_type: 'Payment',
          debit_amount: expect.anything(),
        }),
      }),
    );
    const ledgerArg = tx.supplier_ledger.create.mock.calls[0][0].data;
    expect(Number(ledgerArg.balance_after)).toBe(-500); // 500 owed - 1000 paid
  });

  it('records an advance payment with entry_type Advance', async () => {
    const tx = makeTx();
    tx.supplier.findUnique.mockResolvedValue({ id: 'sup-1', status: 'ACTIVE' });
    tx.supplier_ledger.findFirst.mockResolvedValue(null);
    tx.supplier_payments.create.mockResolvedValue({ id: 'pay-1' });
    const service = new SupplierPaymentsService(makePrisma(tx));

    await service.createPayment('sup-1', { ...baseDto, is_advance: true } as never);

    const ledgerArg = tx.supplier_ledger.create.mock.calls[0][0].data;
    expect(ledgerArg.entry_type).toBe('Advance');
    expect(Number(ledgerArg.balance_after)).toBe(-1000); // 0 owed - 1000 paid
  });
});
