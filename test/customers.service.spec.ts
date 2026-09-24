import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CustomersService, normalizePhone } from '../src/modules/customers/customers.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('normalizePhone', () => {
  it('strips non-digit characters', () => {
    expect(normalizePhone('98765-43210')).toBe('9876543210');
  });

  it('collapses different representations of the same number to the same value', () => {
    expect(normalizePhone('9876543210')).toBe(normalizePhone('98765-43210'));
  });
});

describe('CustomersService', () => {
  let prisma: {
    customers: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
    customer_wallets: { create: jest.Mock };
    $transaction: jest.Mock;
  };
  let service: CustomersService;

  beforeEach(() => {
    prisma = {
      customers: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      customer_wallets: { create: jest.fn() },
      $transaction: jest.fn((cb) => cb(prisma)),
    };
    service = new CustomersService(prisma as unknown as PrismaService);
  });

  it('findOne throws NotFoundException when the customer does not exist', async () => {
    prisma.customers.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findByPhone normalizes the input before querying', async () => {
    prisma.customers.findUnique.mockResolvedValue({ id: 'c1', phone: '9876543210' });
    await service.findByPhone('98765-43210');
    expect(prisma.customers.findUnique).toHaveBeenCalledWith({ where: { phone: '9876543210' } });
  });

  it('findByPhone rejects a malformed phone before hitting the database', async () => {
    await expect(service.findByPhone('123')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.customers.findUnique).not.toHaveBeenCalled();
  });

  it('create rejects a malformed phone before touching the database', async () => {
    await expect(
      service.create({ customer_id: 'CUST-1', phone: 'abc' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('create normalizes the phone and creates the customer plus a zero-balance wallet atomically', async () => {
    prisma.customers.create.mockResolvedValue({ id: 'c1', customer_id: 'CUST-1', phone: '9876543210' });
    prisma.customer_wallets.create.mockResolvedValue({ id: 'w1', customer_id: 'c1', balance: 0 });

    const result = await service.create({
      customer_id: 'CUST-1',
      phone: '98765 43210',
    } as never);

    expect(prisma.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ phone: '9876543210' }) }),
    );
    expect(prisma.customer_wallets.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ customer_id: 'c1', balance: 0 }) }),
    );
    expect(result.id).toBe('c1');
  });

  it('create surfaces a duplicate customer_id/phone as 409, not a raw DB error', async () => {
    prisma.customers.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.create({ customer_id: 'CUST-1', phone: '9876543210' } as never),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('update normalizes a changed phone and rejects duplicates as 409', async () => {
    prisma.customers.findUnique.mockResolvedValue({ id: 'c1' });
    prisma.customers.update.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.update('c1', { phone: '98765 43210' } as never),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.customers.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ phone: '9876543210' }) }),
    );
  });
});
