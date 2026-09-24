import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { SalesReturnsService } from '../src/modules/sales-returns/sales-returns.service';
import { PrismaService } from '../src/prisma/prisma.service';

function makeTx(overrides: Record<string, any> = {}) {
  return {
    $queryRaw: jest.fn(),
    sales_invoices: { findUnique: jest.fn() },
    sales_returns: { create: jest.fn(), findUnique: jest.fn() },
    sales_return_items: { createMany: jest.fn() },
    sales_return_settlements: { create: jest.fn() },
    inventory_movements: { create: jest.fn() },
    customer_wallet_transactions: { create: jest.fn() },
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
  quantity: 2,
  total_value: 200,
};

const baseDto = {
  original_invoice_id: 'inv-1',
  reason: 'Damaged',
  settlement_method: 'Cash' as const,
  items: [{ original_invoice_item_id: 'item-1', quantity: 1 }],
};

describe('SalesReturnsService.computeFinancialYear', () => {
  const service = new SalesReturnsService(makePrisma(makeTx()));

  it('matches the SALES-01 FY convention', () => {
    expect(service.computeFinancialYear(new Date('2026-03-31T00:00:00Z'))).toBe('25-26');
    expect(service.computeFinancialYear(new Date('2026-04-01T00:00:00Z'))).toBe('26-27');
  });
});

describe('SalesReturnsService.create — validation guard clauses (mocked Prisma)', () => {
  it('rejects when the original invoice does not exist', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue(null);
    const service = new SalesReturnsService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects when the original invoice is not Completed', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue({
      id: 'inv-1',
      status: 'Cancelled',
      customer_id: null,
      location_id: 'loc-1',
      sales_invoice_items: [baseInvoiceItem],
    });
    const service = new SalesReturnsService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects Wallet settlement when the invoice has no linked customer', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue({
      id: 'inv-1',
      status: 'Completed',
      customer_id: null,
      location_id: 'loc-1',
      sales_invoice_items: [baseInvoiceItem],
    });
    const service = new SalesReturnsService(makePrisma(tx));

    await expect(
      service.create({ ...baseDto, settlement_method: 'Wallet' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a return item that does not belong to the invoice', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue({
      id: 'inv-1',
      status: 'Completed',
      customer_id: null,
      location_id: 'loc-1',
      sales_invoice_items: [baseInvoiceItem],
    });
    const service = new SalesReturnsService(makePrisma(tx));

    await expect(
      service.create({
        ...baseDto,
        items: [{ original_invoice_item_id: 'not-real', quantity: 1 }],
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a return quantity exceeding the remaining returnable quantity', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue({
      id: 'inv-1',
      status: 'Completed',
      customer_id: null,
      location_id: 'loc-1',
      sales_invoice_items: [baseInvoiceItem],
    });
    tx.$queryRaw.mockImplementation((strings: TemplateStringsArray) => {
      const sql = strings.join('');
      if (sql.includes('SELECT id FROM sales_invoices')) return Promise.resolve([]);
      if (sql.includes('COALESCE(SUM')) return Promise.resolve([{ total: '2' }]);
      return Promise.resolve([]);
    });
    const service = new SalesReturnsService(makePrisma(tx));

    await expect(
      service.create({
        ...baseDto,
        items: [{ original_invoice_item_id: 'item-1', quantity: 1 }],
      } as never),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
