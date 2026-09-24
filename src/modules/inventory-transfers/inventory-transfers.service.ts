import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInventoryTransferDto } from './dto/create-inventory-transfer.dto';

type TxClient = Prisma.TransactionClient;

@Injectable()
export class InventoryTransfersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Same YY-YY financial-year convention as every other numbered document. */
  computeFinancialYear(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
  }

  /**
   * TRF-{5-digit serial}-{FY}, allocated under its own advisory-lock key,
   * independent of every other numbered document in this codebase, using
   * the same "lock, read current max, compute next" technique — no counter
   * table, no unguarded COUNT(*)+1.
   */
  private async generateTransferNo(tx: TxClient, date: Date): Promise<string> {
    const fy = this.computeFinancialYear(date);

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('transfer_number'))`;

    const rows = await tx.$queryRaw<{ transfer_no: string }[]>`
      SELECT transfer_no FROM transfers
      WHERE transfer_no LIKE ${'TRF-%-' + fy}
      ORDER BY transfer_no DESC
      LIMIT 1
    `;

    let nextSerial = 1;
    if (rows.length > 0) {
      const match = rows[0].transfer_no.match(/^TRF-(\d{5})-\d{2}-\d{2}$/);
      if (match) {
        nextSerial = parseInt(match[1], 10) + 1;
      }
    }

    return `TRF-${String(nextSerial).padStart(5, '0')}-${fy}`;
  }

  async create(dto: CreateInventoryTransferDto) {
    const sourceId = dto.source_location_id.trim();
    const destinationId = dto.destination_location_id.trim();

    if (sourceId === destinationId) {
      throw new BadRequestException('Source and destination location must differ');
    }

    return this.prisma.$transaction(async (tx) => {
      const [source, destination] = await Promise.all([
        tx.locations.findUnique({ where: { id: sourceId }, select: { id: true, status: true, location_type: true } }),
        tx.locations.findUnique({ where: { id: destinationId }, select: { id: true, status: true, location_type: true } }),
      ]);

      if (!source) throw new NotFoundException('Source location not found');
      if (!destination) throw new NotFoundException('Destination location not found');

      if (String(source.status) !== 'Active') {
        throw new BadRequestException('Source location is inactive');
      }
      if (String(destination.status) !== 'Active') {
        throw new BadRequestException('Destination location is inactive');
      }

      // Transfer matrix: Warehouse->Retail, Warehouse->Warehouse, and
      // Retail->Warehouse are allowed; Retail->Retail is prohibited.
      if (
        String(source.location_type) === 'Retail_Store' &&
        String(destination.location_type) === 'Retail_Store'
      ) {
        throw new BadRequestException('Retail-to-retail transfers are not permitted');
      }

      const skuIds = [...new Set(dto.items.map((item) => item.sku_id))];

      const skus = await tx.product_skus.findMany({
        where: { id: { in: skuIds } },
        select: {
          id: true,
          sku: true,
          product_id: true,
          status: true,
          products: { select: { id: true, product_name: true, status: true } },
        },
      });

      const skuMap = new Map(skus.map((sku) => [sku.id, sku]));

      if (skus.length !== skuIds.length) {
        const missing = skuIds.filter((id) => !skuMap.has(id));
        throw new NotFoundException(`SKU not found: ${missing.join(', ')}`);
      }

      for (const item of dto.items) {
        const sku = skuMap.get(item.sku_id)!;
        if (String(sku.status) !== 'Active') {
          throw new BadRequestException(`SKU ${sku.sku} is inactive`);
        }
        if (String(sku.products.status) !== 'Active') {
          throw new BadRequestException(`Product ${sku.products.product_name} is inactive`);
        }
      }

      // No stock reservation or movement happens here — quantities are
      // re-validated and moved atomically only at approval time.
      const transferId = crypto.randomUUID();
      const requestedAt = new Date();
      const transferNo = await this.generateTransferNo(tx, requestedAt);

      const transfer = await tx.transfers.create({
        data: {
          id: transferId,
          transfer_no: transferNo,
          source_location_id: sourceId,
          destination_location_id: destinationId,
          status: 'Requested',
          reason: dto.reason,
          requested_at: requestedAt,
          updated_at: requestedAt,
        },
      });

      await tx.transfer_items.createMany({
        data: dto.items.map((item) => ({
          transfer_id: transfer.id,
          product_id: skuMap.get(item.sku_id)!.product_id,
          sku_id: item.sku_id,
          quantity: item.quantity,
        })),
      });

      return this.findOne(transfer.id, tx);
    });
  }

  async approve(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Row-level lock on the transfer: a second concurrent approve()/
      // reverse() for the same id blocks here until the first transaction
      // commits or rolls back, then observes the up-to-date status below —
      // preventing a double-approve race, the same technique used for
      // purchase-invoice receive() and every return/exchange in this codebase.
      await tx.$queryRaw`SELECT id FROM transfers WHERE id = ${id}::uuid FOR UPDATE`;

      const transfer = await tx.transfers.findUnique({
        where: { id },
        include: { transfer_items: true },
      });

      if (!transfer) {
        throw new NotFoundException('Transfer not found');
      }

      if (String(transfer.status) !== 'Requested') {
        throw new ConflictException(
          `Transfer cannot be approved from status ${transfer.status}`,
        );
      }

      for (const item of transfer.transfer_items) {
        // Decrement source: atomic guarded UPDATE, negative-stock-protected
        // (same technique as sales/purchase-return outgoing stock).
        const sourceRows = await tx.$queryRaw<{ quantity: number }[]>`
          UPDATE inventory_stock
          SET quantity = quantity - ${item.quantity}, updated_at = now()
          WHERE sku_id = ${item.sku_id}::uuid AND location_id = ${transfer.source_location_id}::uuid
            AND quantity - ${item.quantity} >= 0
          RETURNING quantity
        `;

        if (sourceRows.length === 0) {
          throw new ConflictException(
            `Insufficient stock for SKU ${item.sku_id} at the source location`,
          );
        }

        const sourceAfter = sourceRows[0].quantity;
        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: item.sku_id,
            location_id: transfer.source_location_id,
            movement_type: 'Transfer_Out',
            quantity_change: -item.quantity,
            quantity_before: sourceAfter + item.quantity,
            quantity_after: sourceAfter,
            reference_type: 'transfer',
            reference_id: transfer.id,
          },
        });

        // Increment destination: atomic upsert-increment, same technique as
        // purchase-invoice receive().
        const destRows = await tx.$queryRaw<{ quantity: number }[]>`
          INSERT INTO inventory_stock (sku_id, location_id, quantity, updated_at)
          VALUES (${item.sku_id}::uuid, ${transfer.destination_location_id}::uuid, ${item.quantity}, now())
          ON CONFLICT (sku_id, location_id)
          DO UPDATE SET quantity = inventory_stock.quantity + EXCLUDED.quantity, updated_at = now()
          RETURNING quantity
        `;

        const destAfter = destRows[0].quantity;
        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: item.sku_id,
            location_id: transfer.destination_location_id,
            movement_type: 'Transfer_In',
            quantity_change: item.quantity,
            quantity_before: destAfter - item.quantity,
            quantity_after: destAfter,
            reference_type: 'transfer',
            reference_id: transfer.id,
          },
        });
      }

      const approvedAt = new Date();
      await tx.transfers.update({
        where: { id: transfer.id },
        data: { status: 'Approved', approved_at: approvedAt, updated_at: approvedAt },
      });

      return this.findOne(transfer.id, tx);
    });
  }

  async reverse(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM transfers WHERE id = ${id}::uuid FOR UPDATE`;

      const transfer = await tx.transfers.findUnique({
        where: { id },
        include: { transfer_items: true },
      });

      if (!transfer) {
        throw new NotFoundException('Transfer not found');
      }

      if (String(transfer.status) !== 'Approved') {
        throw new ConflictException(
          `Transfer cannot be reversed from status ${transfer.status}`,
        );
      }

      for (const item of transfer.transfer_items) {
        // Remove destination quantity: guarded, negative-stock-protected —
        // a reversal can never leave the destination negative even if it
        // was independently drawn down since approval.
        const destRows = await tx.$queryRaw<{ quantity: number }[]>`
          UPDATE inventory_stock
          SET quantity = quantity - ${item.quantity}, updated_at = now()
          WHERE sku_id = ${item.sku_id}::uuid AND location_id = ${transfer.destination_location_id}::uuid
            AND quantity - ${item.quantity} >= 0
          RETURNING quantity
        `;

        if (destRows.length === 0) {
          throw new ConflictException(
            `Cannot reverse: destination stock for SKU ${item.sku_id} would become negative`,
          );
        }

        const destAfter = destRows[0].quantity;
        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: item.sku_id,
            location_id: transfer.destination_location_id,
            movement_type: 'Transfer_Out',
            quantity_change: -item.quantity,
            quantity_before: destAfter + item.quantity,
            quantity_after: destAfter,
            reference_type: 'transfer_reversal',
            reference_id: transfer.id,
          },
        });

        // Restore source quantity: atomic upsert-increment.
        const sourceRows = await tx.$queryRaw<{ quantity: number }[]>`
          INSERT INTO inventory_stock (sku_id, location_id, quantity, updated_at)
          VALUES (${item.sku_id}::uuid, ${transfer.source_location_id}::uuid, ${item.quantity}, now())
          ON CONFLICT (sku_id, location_id)
          DO UPDATE SET quantity = inventory_stock.quantity + EXCLUDED.quantity, updated_at = now()
          RETURNING quantity
        `;

        const sourceAfter = sourceRows[0].quantity;
        await tx.inventory_movements.create({
          data: {
            id: crypto.randomUUID(),
            sku_id: item.sku_id,
            location_id: transfer.source_location_id,
            movement_type: 'Transfer_In',
            quantity_change: item.quantity,
            quantity_before: sourceAfter - item.quantity,
            quantity_after: sourceAfter,
            reference_type: 'transfer_reversal',
            reference_id: transfer.id,
          },
        });
      }

      const reversedAt = new Date();
      await tx.transfers.update({
        where: { id: transfer.id },
        data: { status: 'Reversed', reversed_at: reversedAt, updated_at: reversedAt },
      });

      return this.findOne(transfer.id, tx);
    });
  }

  async findOne(id: string, tx?: TxClient) {
    const client = tx ?? this.prisma;
    const transfer = await client.transfers.findUnique({
      where: { id },
      include: { transfer_items: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }

  async findAll(params: { sourceLocationId?: string; destinationLocationId?: string; page?: number; limit?: number }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where: Prisma.transfersWhereInput = {
      ...(params.sourceLocationId ? { source_location_id: params.sourceLocationId } : {}),
      ...(params.destinationLocationId ? { destination_location_id: params.destinationLocationId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transfers.findMany({
        where,
        orderBy: [{ requested_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transfers.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }
}
