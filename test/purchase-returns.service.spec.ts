import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PurchaseReturnsService } from '../src/modules/purchase-returns/purchase-returns.service';
import { PrismaService } from '../src/prisma/prisma.service';

function makeTx(overrides: Record<string, any> = {}) {
  return {
    $queryRaw: jest.fn(),
    purchase_invoices: { findUnique: jest.fn() },
    supplier: { findUnique: jest.fn() },
    locations: { findMany: jest.fn() },
    purchase_returns: { create: jest.fn(), findUnique: jest.fn() },
    purchase_return_items: { createMany: jest.fn() },
    supplier_credit_notes: { create: jest.fn() },
    supplier_ledger: { findFirst: jest.fn(), create: jest.fn() },
    inventory_movements: { create: jest.fn() },
    ...overrides,
  };
}

function makePrisma(tx: any): PrismaService {
  return { $transaction: (fn: any) => fn(tx) } as unknown as PrismaService;
}

const baseInvoiceItem = {
  id: 'item-1',
  product_id: 'prod-1',
  sku_id: 'sku-1',
  quantity: 10,
  purchase_rate: 100,
  gst_rate: 0,
  taxable_value: 1000,
  cgst_amount: 0,
  sgst_amount: 0,
  igst_amount: 0,
  gst_amount: 0,
  total_value: 1000,
};

const baseInvoice = {
  id: 'inv-1',
  status: 'Received',
  supplier_id: 'sup-1',
  location: 'Main Warehouse',
  purchase_invoice_items: [baseInvoiceItem],
};

const baseDto = {
  purchase_invoice_id: 'inv-1',
  reason: 'Damaged goods',
  items: [{ original_invoice_item_id: 'item-1', quantity: 2 }],
};

describe('PurchaseReturnsService.computeFinancialYear', () => {
  const service = new PurchaseReturnsService(makePrisma(makeTx()));

  it('matches the SALES/SUPPLIER FY convention', () => {
    expect(service.computeFinancialYear(new Date('2026-03-31T00:00:00Z'))).toBe('25-26');
    expect(service.computeFinancialYear(new Date('2026-04-01T00:00:00Z'))).toBe('26-27');
  });
});

describe('PurchaseReturnsService.create — validation guard clauses (mocked Prisma)', () => {
  it('rejects when the purchase invoice does not exist', async () => {
    const tx = makeTx();
    tx.purchase_invoices.findUnique.mockResolvedValue(null);
    const service = new PurchaseReturnsService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects when the purchase invoice is not Received', async () => {
    const tx = makeTx();
    tx.purchase_invoices.findUnique.mockResolvedValue({ ...baseInvoice, status: 'Draft' });
    const service = new PurchaseReturnsService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the supplier is inactive', async () => {
    const tx = makeTx();
    tx.purchase_invoices.findUnique.mockResolvedValue(baseInvoice);
    tx.supplier.findUnique.mockResolvedValue({ id: 'sup-1', status: 'INACTIVE' });
    const service = new PurchaseReturnsService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the supplier no longer exists', async () => {
    const tx = makeTx();
    tx.purchase_invoices.findUnique.mockResolvedValue(baseInvoice);
    tx.supplier.findUnique.mockResolvedValue(null);
    const service = new PurchaseReturnsService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a return item that does not belong to the invoice', async () => {
    const tx = makeTx();
    tx.purchase_invoices.findUnique.mockResolvedValue(baseInvoice);
    tx.supplier.findUnique.mockResolvedValue({ id: 'sup-1', status: 'ACTIVE' });
    tx.locations.findMany.mockResolvedValue([{ id: 'loc-1' }]);
    const service = new PurchaseReturnsService(makePrisma(tx));

    await expect(
      service.create({
        ...baseDto,
        items: [{ original_invoice_item_id: 'not-real', quantity: 1 }],
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a return quantity exceeding the remaining returnable quantity', async () => {
    const tx = makeTx();
    tx.purchase_invoices.findUnique.mockResolvedValue(baseInvoice);
    tx.supplier.findUnique.mockResolvedValue({ id: 'sup-1', status: 'ACTIVE' });
    tx.locations.findMany.mockResolvedValue([{ id: 'loc-1' }]);
    tx.$queryRaw.mockImplementation((strings: TemplateStringsArray) => {
      const sql = strings.join('');
      if (sql.includes('COALESCE(SUM')) return Promise.resolve([{ total: '9' }]);
      return Promise.resolve([]);
    });
    const service = new PurchaseReturnsService(makePrisma(tx));

    await expect(
      service.create({
        ...baseDto,
        items: [{ original_invoice_item_id: 'item-1', quantity: 5 }],
      } as never),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects when the invoice warehouse cannot be resolved', async () => {
    const tx = makeTx();
    tx.purchase_invoices.findUnique.mockResolvedValue(baseInvoice);
    tx.supplier.findUnique.mockResolvedValue({ id: 'sup-1', status: 'ACTIVE' });
    tx.locations.findMany.mockResolvedValue([]);
    const service = new PurchaseReturnsService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(ConflictException);
  });
});
