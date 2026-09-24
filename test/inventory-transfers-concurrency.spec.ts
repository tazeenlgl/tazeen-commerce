/**
 * Real-PostgreSQL concurrency and integrity tests for INVENTORY-TRANSFER-01, following the
 * same pattern as SALES-01/02/03, SUPPLIER-01 and PURCHASE-RETURN-01. Skips entirely when
 * DATABASE_URL is unavailable — never reports a skipped run as passed.
 */
import { PrismaService } from '../src/prisma/prisma.service';
import { InventoryTransfersService } from '../src/modules/inventory-transfers/inventory-transfers.service';

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const describeIfDb = DB_AVAILABLE ? describe : describe.skip;

if (!DB_AVAILABLE) {
  // eslint-disable-next-line no-console
  console.warn(
    'SKIPPED: test/inventory-transfers-concurrency.spec.ts requires DATABASE_URL pointing at ' +
      'a real Postgres instance. Inventory transfer concurrency was NOT verified in this run.',
  );
}

describeIfDb('inventory transfers (real PostgreSQL)', () => {
  let prisma: PrismaService;
  let transfers: InventoryTransfersService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    transfers = new InventoryTransfersService(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function makeLocation(type: 'Warehouse' | 'Retail_Store', status: 'Active' | 'Inactive' = 'Active') {
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    return prisma.locations.create({
      data: {
        location_code: `LOC${suffix}`.slice(0, 50),
        location_name: `Location ${suffix}`,
        location_type: type,
        status,
      },
    });
  }

  async function makeSku(stock?: { locationId: string; quantity: number }) {
    const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const category = await prisma.product_categories.create({
      data: { category_code: `CAT${suffix}`.slice(0, 50), category_name: 'Test Category', status: 'Active' },
    });
    const product = await prisma.products.create({
      data: {
        product_id: `P${suffix}`.slice(0, 50),
        core_sku: `CORE${suffix}`.slice(0, 50),
        product_name: 'Test Product',
        category_id: category.id,
        gst_rate: 0,
        purchase_rate: 100,
        status: 'Active',
      },
    });
    const sku = await prisma.product_skus.create({
      data: { product_id: product.id, sku: `SKU${suffix}`.slice(0, 50), sequence_no: 1, mrp: 150, status: 'Active' },
    });

    if (stock) {
      await prisma.inventory_stock.create({
        data: { sku_id: sku.id, location_id: stock.locationId, quantity: stock.quantity },
      });
    }

    return sku;
  }

  async function stockOf(skuId: string, locationId: string) {
    const row = await prisma.inventory_stock.findUnique({
      where: { sku_id_location_id: { sku_id: skuId, location_id: locationId } },
    });
    return row?.quantity ?? 0;
  }

  it('creates a transfer request without mutating any stock', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 20 });

    const transfer = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail.id,
      reason: 'Restock',
      items: [{ sku_id: sku.id, quantity: 5 }],
    } as never);

    expect(transfer.transfer_no).toMatch(/^TRF-\d{5}-\d{2}-\d{2}$/);
    expect(transfer.status).toBe('Requested');
    expect(await stockOf(sku.id, warehouse.id)).toBe(20); // unchanged
    expect(await stockOf(sku.id, retail.id)).toBe(0); // unchanged
  }, 20000);

  it('approves a Warehouse -> Retail transfer atomically', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 20 });

    const transfer = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail.id,
      reason: 'Restock',
      items: [{ sku_id: sku.id, quantity: 5 }],
    } as never);

    const approved = await transfers.approve(transfer.id);
    expect(approved.status).toBe('Approved');
    expect(await stockOf(sku.id, warehouse.id)).toBe(15);
    expect(await stockOf(sku.id, retail.id)).toBe(5);

    const movements = await prisma.inventory_movements.findMany({
      where: { reference_type: 'transfer', reference_id: transfer.id },
    });
    expect(movements.find((m) => m.movement_type === 'Transfer_Out' && m.location_id === warehouse.id)).toBeTruthy();
    expect(movements.find((m) => m.movement_type === 'Transfer_In' && m.location_id === retail.id)).toBeTruthy();
  }, 20000);

  it('approves a Warehouse -> Warehouse transfer', async () => {
    const wh1 = await makeLocation('Warehouse');
    const wh2 = await makeLocation('Warehouse');
    const sku = await makeSku({ locationId: wh1.id, quantity: 10 });

    const transfer = await transfers.create({
      source_location_id: wh1.id,
      destination_location_id: wh2.id,
      reason: 'Rebalance',
      items: [{ sku_id: sku.id, quantity: 4 }],
    } as never);
    await transfers.approve(transfer.id);

    expect(await stockOf(sku.id, wh1.id)).toBe(6);
    expect(await stockOf(sku.id, wh2.id)).toBe(4);
  }, 20000);

  it('approves a Retail -> Warehouse transfer', async () => {
    const retail = await makeLocation('Retail_Store');
    const warehouse = await makeLocation('Warehouse');
    const sku = await makeSku({ locationId: retail.id, quantity: 8 });

    const transfer = await transfers.create({
      source_location_id: retail.id,
      destination_location_id: warehouse.id,
      reason: 'Return to warehouse',
      items: [{ sku_id: sku.id, quantity: 3 }],
    } as never);
    await transfers.approve(transfer.id);

    expect(await stockOf(sku.id, retail.id)).toBe(5);
    expect(await stockOf(sku.id, warehouse.id)).toBe(3);
  }, 20000);

  it('rejects a Retail -> Retail transfer', async () => {
    const retail1 = await makeLocation('Retail_Store');
    const retail2 = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: retail1.id, quantity: 5 });

    await expect(
      transfers.create({
        source_location_id: retail1.id,
        destination_location_id: retail2.id,
        reason: 'Should fail',
        items: [{ sku_id: sku.id, quantity: 1 }],
      } as never),
    ).rejects.toThrow();
  }, 20000);

  it('rejects source = destination', async () => {
    const warehouse = await makeLocation('Warehouse');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 5 });

    await expect(
      transfers.create({
        source_location_id: warehouse.id,
        destination_location_id: warehouse.id,
        reason: 'Should fail',
        items: [{ sku_id: sku.id, quantity: 1 }],
      } as never),
    ).rejects.toThrow();
  }, 20000);

  it('rejects a transfer touching an inactive location', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store', 'Inactive');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 5 });

    await expect(
      transfers.create({
        source_location_id: warehouse.id,
        destination_location_id: retail.id,
        reason: 'Should fail',
        items: [{ sku_id: sku.id, quantity: 1 }],
      } as never),
    ).rejects.toThrow();
  }, 20000);

  it('handles a multi-line transfer atomically', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const skuA = await makeSku({ locationId: warehouse.id, quantity: 10 });
    const skuB = await makeSku({ locationId: warehouse.id, quantity: 10 });

    const transfer = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail.id,
      reason: 'Multi-line',
      items: [
        { sku_id: skuA.id, quantity: 3 },
        { sku_id: skuB.id, quantity: 4 },
      ],
    } as never);
    await transfers.approve(transfer.id);

    expect(await stockOf(skuA.id, warehouse.id)).toBe(7);
    expect(await stockOf(skuB.id, warehouse.id)).toBe(6);
    expect(await stockOf(skuA.id, retail.id)).toBe(3);
    expect(await stockOf(skuB.id, retail.id)).toBe(4);
  }, 20000);

  it('rolls back the entire multi-line approval if one line has insufficient stock', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const skuA = await makeSku({ locationId: warehouse.id, quantity: 10 });
    const skuB = await makeSku({ locationId: warehouse.id, quantity: 1 });

    const transfer = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail.id,
      reason: 'Should fail on second line',
      items: [
        { sku_id: skuA.id, quantity: 3 },
        { sku_id: skuB.id, quantity: 5 },
      ],
    } as never);

    await expect(transfers.approve(transfer.id)).rejects.toThrow();

    // All-or-nothing: skuA's decrement must also have rolled back.
    expect(await stockOf(skuA.id, warehouse.id)).toBe(10);
    expect(await stockOf(skuB.id, warehouse.id)).toBe(1);
    expect(await stockOf(skuA.id, retail.id)).toBe(0);

    const reloaded = await transfers.findOne(transfer.id);
    expect(reloaded.status).toBe('Requested');
  }, 20000);

  it('serializes concurrent approvals of the same transfer (only one succeeds)', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 10 });

    const transfer = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail.id,
      reason: 'Double approve race',
      items: [{ sku_id: sku.id, quantity: 5 }],
    } as never);

    const results = await Promise.allSettled([
      transfers.approve(transfer.id),
      transfers.approve(transfer.id),
    ]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(await stockOf(sku.id, warehouse.id)).toBe(5); // decremented exactly once
    expect(await stockOf(sku.id, retail.id)).toBe(5); // incremented exactly once
  }, 20000);

  it('serializes concurrent transfers competing for the same source SKU', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail1 = await makeLocation('Retail_Store');
    const retail2 = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 5 });

    const t1 = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail1.id,
      reason: 'Contender A',
      items: [{ sku_id: sku.id, quantity: 4 }],
    } as never);
    const t2 = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail2.id,
      reason: 'Contender B',
      items: [{ sku_id: sku.id, quantity: 4 }],
    } as never);

    const results = await Promise.allSettled([transfers.approve(t1.id), transfers.approve(t2.id)]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Source has 5; two requests for 4 each can never both succeed.
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(await stockOf(sku.id, warehouse.id)).toBeGreaterThanOrEqual(0);
    expect(await stockOf(sku.id, warehouse.id)).toBe(1);
  }, 20000);

  it('reverses an approved transfer, restoring source and removing destination stock', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 10 });

    const transfer = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail.id,
      reason: 'To be reversed',
      items: [{ sku_id: sku.id, quantity: 6 }],
    } as never);
    await transfers.approve(transfer.id);

    const reversed = await transfers.reverse(transfer.id);
    expect(reversed.status).toBe('Reversed');
    expect(await stockOf(sku.id, warehouse.id)).toBe(10);
    expect(await stockOf(sku.id, retail.id)).toBe(0);

    const movements = await prisma.inventory_movements.findMany({
      where: { reference_type: 'transfer_reversal', reference_id: transfer.id },
    });
    expect(movements).toHaveLength(2);
  }, 20000);

  it('rejects a duplicate reversal of the same transfer', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 10 });

    const transfer = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail.id,
      reason: 'Duplicate reversal check',
      items: [{ sku_id: sku.id, quantity: 5 }],
    } as never);
    await transfers.approve(transfer.id);
    await transfers.reverse(transfer.id);

    await expect(transfers.reverse(transfer.id)).rejects.toThrow();

    // Stock must reflect exactly one reversal, not two.
    expect(await stockOf(sku.id, warehouse.id)).toBe(10);
    expect(await stockOf(sku.id, retail.id)).toBe(0);
  }, 20000);

  it('rejects reversing a transfer that was never approved', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 10 });

    const transfer = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail.id,
      reason: 'Never approved',
      items: [{ sku_id: sku.id, quantity: 5 }],
    } as never);

    await expect(transfers.reverse(transfer.id)).rejects.toThrow();
  }, 20000);

  it('serializes concurrent reversal attempts of the same transfer (only one succeeds)', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 10 });

    const transfer = await transfers.create({
      source_location_id: warehouse.id,
      destination_location_id: retail.id,
      reason: 'Concurrent reversal race',
      items: [{ sku_id: sku.id, quantity: 5 }],
    } as never);
    await transfers.approve(transfer.id);

    const results = await Promise.allSettled([
      transfers.reverse(transfer.id),
      transfers.reverse(transfer.id),
    ]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(await stockOf(sku.id, warehouse.id)).toBe(10);
    expect(await stockOf(sku.id, retail.id)).toBe(0);
  }, 20000);

  it('allocates unique sequential transfer numbers under concurrent creation', async () => {
    const warehouse = await makeLocation('Warehouse');
    const retail = await makeLocation('Retail_Store');
    const sku = await makeSku({ locationId: warehouse.id, quantity: 50 });

    const results = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        transfers.create({
          source_location_id: warehouse.id,
          destination_location_id: retail.id,
          reason: 'Concurrent numbering',
          items: [{ sku_id: sku.id, quantity: 1 }],
        } as never),
      ),
    );

    const transferNumbers = results.map((r) => r.transfer_no);
    expect(new Set(transferNumbers).size).toBe(5);
  }, 30000);
});
