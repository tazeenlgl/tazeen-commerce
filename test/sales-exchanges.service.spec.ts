import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesExchangesService } from '../src/modules/sales-exchanges/sales-exchanges.service';
import { PrismaService } from '../src/prisma/prisma.service';

function makeTx(overrides: Record<string, any> = {}) {
  return {
    $queryRaw: jest.fn(),
    sales_invoices: { findUnique: jest.fn() },
    product_skus: { findMany: jest.fn() },
    sales_returns: { create: jest.fn(), findUnique: jest.fn() },
    sales_return_items: { createMany: jest.fn() },
    exchange_replacement_items: { createMany: jest.fn() },
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
  quantity: 1,
  total_value: 100,
};

const baseInvoice = {
  id: 'inv-1',
  status: 'Completed',
  customer_id: null,
  location_id: 'loc-1',
  sales_invoice_items: [baseInvoiceItem],
};

const baseReplacementSku = {
  id: 'sku-2',
  sku: 'SKU2',
  product_id: 'prod-2',
  mrp: 100,
  status: 'Active',
  products: { id: 'prod-2', product_name: 'P2', status: 'Active', gst_rate: 0 },
};

const baseDto = {
  original_invoice_id: 'inv-1',
  reason: 'Wrong size',
  original_items: [{ original_invoice_item_id: 'item-1', quantity: 1 }],
  replacement_items: [{ sku_id: 'sku-2', quantity: 1 }],
};

describe('SalesExchangesService.computeFinancialYear', () => {
  const service = new SalesExchangesService(makePrisma(makeTx()));

  it('matches the SALES-01/02 FY convention', () => {
    expect(service.computeFinancialYear(new Date('2026-03-31T00:00:00Z'))).toBe('25-26');
    expect(service.computeFinancialYear(new Date('2026-04-01T00:00:00Z'))).toBe('26-27');
  });
});

describe('SalesExchangesService.create — validation guard clauses (mocked Prisma)', () => {
  it('rejects when the original invoice does not exist', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue(null);
    const service = new SalesExchangesService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects when the original invoice is not Completed', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue({ ...baseInvoice, status: 'Cancelled' });
    const service = new SalesExchangesService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when a replacement SKU does not exist', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue(baseInvoice);
    tx.$queryRaw.mockImplementation((strings: TemplateStringsArray) => {
      const sql = strings.join('');
      if (sql.includes('COALESCE(SUM')) return Promise.resolve([{ total: '0' }]);
      return Promise.resolve([]);
    });
    tx.product_skus.findMany.mockResolvedValue([]);
    const service = new SalesExchangesService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('requires settlement_method when the exchange has a non-zero difference', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue(baseInvoice);
    tx.$queryRaw.mockImplementation((strings: TemplateStringsArray) => {
      const sql = strings.join('');
      if (sql.includes('COALESCE(SUM')) return Promise.resolve([{ total: '0' }]);
      if (sql.includes('UPDATE inventory_stock')) return Promise.resolve([{ quantity: 5 }]);
      return Promise.resolve([]);
    });
    tx.product_skus.findMany.mockResolvedValue([
      { ...baseReplacementSku, mrp: 200 }, // pricier replacement -> non-zero difference
    ]);
    const service = new SalesExchangesService(makePrisma(tx));

    await expect(service.create(baseDto as never)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects Wallet settlement when the invoice has no linked customer', async () => {
    const tx = makeTx();
    tx.sales_invoices.findUnique.mockResolvedValue(baseInvoice);
    tx.$queryRaw.mockImplementation((strings: TemplateStringsArray) => {
      const sql = strings.join('');
      if (sql.includes('COALESCE(SUM')) return Promise.resolve([{ total: '0' }]);
      if (sql.includes('UPDATE inventory_stock')) return Promise.resolve([{ quantity: 5 }]);
      return Promise.resolve([]);
    });
    tx.product_skus.findMany.mockResolvedValue([{ ...baseReplacementSku, mrp: 200 }]);
    const service = new SalesExchangesService(makePrisma(tx));

    await expect(
      service.create({ ...baseDto, settlement_method: 'Wallet' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
