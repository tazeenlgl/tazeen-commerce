import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesService } from '../src/modules/sales/sales.service';
import { PrismaService } from '../src/prisma/prisma.service';

function makeTx(overrides: Record<string, any> = {}) {
  return {
    locations: { findUnique: jest.fn() },
    customers: { findUnique: jest.fn() },
    product_skus: { findMany: jest.fn() },
    $queryRaw: jest.fn(),
    inventory_movements: { create: jest.fn() },
    sales_invoices: { create: jest.fn(), findUnique: jest.fn() },
    sales_invoice_items: { createMany: jest.fn() },
    sales_invoice_payments: { create: jest.fn() },
    customer_wallet_transactions: { create: jest.fn() },
    ...overrides,
  };
}

function makePrisma(tx: any): PrismaService {
  return {
    $transaction: (fn: any) => fn(tx),
  } as unknown as PrismaService;
}

const baseDto = {
  location_id: 'loc-1',
  items: [{ sku_id: 'sku-1', quantity: 1 }],
  payments: [{ payment_method: 'Cash', amount: 100 }],
};

describe('SalesService.computeFinancialYear', () => {
  const service = new SalesService(makePrisma(makeTx()));

  it('computes the FY for dates before 1 April', () => {
    expect(service.computeFinancialYear(new Date('2026-03-31T00:00:00Z'))).toBe('25-26');
  });

  it('computes the FY for dates on/after 1 April', () => {
    expect(service.computeFinancialYear(new Date('2026-04-01T00:00:00Z'))).toBe('26-27');
  });
});

describe('SalesService.create — validation guard clauses (mocked Prisma)', () => {
  it('rejects when the location does not exist', async () => {
    const tx = makeTx();
    tx.locations.findUnique.mockResolvedValue(null);
    const service = new SalesService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects when the location is inactive', async () => {
    const tx = makeTx();
    tx.locations.findUnique.mockResolvedValue({ id: 'loc-1', status: 'Inactive' });
    const service = new SalesService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the supplied customer does not exist', async () => {
    const tx = makeTx();
    tx.locations.findUnique.mockResolvedValue({ id: 'loc-1', status: 'Active' });
    tx.customers.findUnique.mockResolvedValue(null);
    const service = new SalesService(makePrisma(tx));

    await expect(
      service.create({ ...baseDto, customer_id: 'cust-1' } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects when a SKU does not exist', async () => {
    const tx = makeTx();
    tx.locations.findUnique.mockResolvedValue({ id: 'loc-1', status: 'Active' });
    tx.product_skus.findMany.mockResolvedValue([]);
    const service = new SalesService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects an inactive SKU', async () => {
    const tx = makeTx();
    tx.locations.findUnique.mockResolvedValue({ id: 'loc-1', status: 'Active' });
    tx.product_skus.findMany.mockResolvedValue([
      {
        id: 'sku-1',
        sku: 'SKU1',
        product_id: 'prod-1',
        mrp: 100,
        status: 'Inactive',
        products: { id: 'prod-1', product_name: 'P1', status: 'Active', gst_rate: 0 },
      },
    ]);
    const service = new SalesService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a Wallet payment when no customer is linked to the sale', async () => {
    const tx = makeTx();
    tx.locations.findUnique.mockResolvedValue({ id: 'loc-1', status: 'Active' });
    tx.product_skus.findMany.mockResolvedValue([
      {
        id: 'sku-1',
        sku: 'SKU1',
        product_id: 'prod-1',
        mrp: 100,
        status: 'Active',
        products: { id: 'prod-1', product_name: 'P1', status: 'Active', gst_rate: 0 },
      },
    ]);
    const service = new SalesService(makePrisma(tx));

    await expect(
      service.create({
        ...baseDto,
        payments: [{ payment_method: 'Wallet', amount: 100 }],
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when payments do not sum to the payable amount', async () => {
    const tx = makeTx();
    tx.locations.findUnique.mockResolvedValue({ id: 'loc-1', status: 'Active' });
    tx.product_skus.findMany.mockResolvedValue([
      {
        id: 'sku-1',
        sku: 'SKU1',
        product_id: 'prod-1',
        mrp: 100,
        status: 'Active',
        products: { id: 'prod-1', product_name: 'P1', status: 'Active', gst_rate: 0 },
      },
    ]);
    const service = new SalesService(makePrisma(tx));

    await expect(
      service.create({
        ...baseDto,
        payments: [{ payment_method: 'Cash', amount: 50 }],
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
