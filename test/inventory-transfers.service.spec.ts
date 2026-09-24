import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InventoryTransfersService } from '../src/modules/inventory-transfers/inventory-transfers.service';
import { PrismaService } from '../src/prisma/prisma.service';

function makeTx(overrides: Record<string, any> = {}) {
  return {
    $queryRaw: jest.fn(),
    locations: { findUnique: jest.fn() },
    product_skus: { findMany: jest.fn() },
    transfers: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    transfer_items: { createMany: jest.fn() },
    inventory_movements: { create: jest.fn() },
    ...overrides,
  };
}

function makePrisma(tx: any): PrismaService {
  return { $transaction: (fn: any) => fn(tx) } as unknown as PrismaService;
}

const baseDto = {
  source_location_id: 'loc-wh',
  destination_location_id: 'loc-retail',
  reason: 'Restock',
  items: [{ sku_id: 'sku-1', quantity: 5 }],
};

describe('InventoryTransfersService.computeFinancialYear', () => {
  const service = new InventoryTransfersService(makePrisma(makeTx()));

  it('matches the established FY convention', () => {
    expect(service.computeFinancialYear(new Date('2026-03-31T00:00:00Z'))).toBe('25-26');
    expect(service.computeFinancialYear(new Date('2026-04-01T00:00:00Z'))).toBe('26-27');
  });
});

describe('InventoryTransfersService.create — validation guard clauses (mocked Prisma)', () => {
  it('rejects when source equals destination', async () => {
    const tx = makeTx();
    const service = new InventoryTransfersService(makePrisma(tx));

    await expect(
      service.create({ ...baseDto, destination_location_id: 'loc-wh' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the source location does not exist', async () => {
    const tx = makeTx();
    tx.locations.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'loc-retail', status: 'Active', location_type: 'Retail_Store' });
    const service = new InventoryTransfersService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects retail-to-retail transfers', async () => {
    const tx = makeTx();
    tx.locations.findUnique
      .mockResolvedValueOnce({ id: 'loc-wh', status: 'Active', location_type: 'Retail_Store' })
      .mockResolvedValueOnce({ id: 'loc-retail', status: 'Active', location_type: 'Retail_Store' });
    const service = new InventoryTransfersService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the destination location is inactive', async () => {
    const tx = makeTx();
    tx.locations.findUnique
      .mockResolvedValueOnce({ id: 'loc-wh', status: 'Active', location_type: 'Warehouse' })
      .mockResolvedValueOnce({ id: 'loc-retail', status: 'Inactive', location_type: 'Retail_Store' });
    const service = new InventoryTransfersService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when a SKU does not exist', async () => {
    const tx = makeTx();
    tx.locations.findUnique
      .mockResolvedValueOnce({ id: 'loc-wh', status: 'Active', location_type: 'Warehouse' })
      .mockResolvedValueOnce({ id: 'loc-retail', status: 'Active', location_type: 'Retail_Store' });
    tx.product_skus.findMany.mockResolvedValue([]);
    const service = new InventoryTransfersService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('InventoryTransfersService.approve/reverse — status guard clauses (mocked Prisma)', () => {
  it('rejects approving a transfer that is not Requested', async () => {
    const tx = makeTx();
    tx.transfers.findUnique.mockResolvedValue({ id: 't-1', status: 'Approved', transfer_items: [] });
    const service = new InventoryTransfersService(makePrisma(tx));

    await expect(service.approve('t-1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects approving a non-existent transfer', async () => {
    const tx = makeTx();
    tx.transfers.findUnique.mockResolvedValue(null);
    const service = new InventoryTransfersService(makePrisma(tx));

    await expect(service.approve('t-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects reversing a transfer that is not Approved', async () => {
    const tx = makeTx();
    tx.transfers.findUnique.mockResolvedValue({ id: 't-1', status: 'Requested', transfer_items: [] });
    const service = new InventoryTransfersService(makePrisma(tx));

    await expect(service.reverse('t-1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects reversing an already-reversed transfer', async () => {
    const tx = makeTx();
    tx.transfers.findUnique.mockResolvedValue({ id: 't-1', status: 'Reversed', transfer_items: [] });
    const service = new InventoryTransfersService(makePrisma(tx));

    await expect(service.reverse('t-1')).rejects.toBeInstanceOf(ConflictException);
  });
});
