import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdjustmentDto } from './create-adjustment.dto';

@Injectable()
export class InventoryAdjustmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAdjustmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const sku = await tx.product_skus.findUnique({
        where: { id: dto.sku_id },
        select: {
          id: true,
          sku: true,
          status: true,
          product_id: true,
        },
      });

      if (!sku) {
        throw new NotFoundException('SKU not found');
      }

      const location = await tx.locations.findUnique({
        where: { id: dto.location_id },
        select: {
          id: true,
          location_code: true,
          location_name: true,
          status: true,
        },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }

      if (location.status !== 'Active') {
        throw new ConflictException(
          'Inactive location cannot receive stock adjustments',
        );
      }

      const reason = await tx.transaction_reasons.findUnique({
        where: { id: dto.reason_id },
        select: {
          id: true,
          reason_type: true,
          reason_name: true,
          is_active: true,
        },
      });

      if (!reason) {
        throw new NotFoundException('Adjustment reason not found');
      }

      if (!reason.is_active) {
        throw new ConflictException('Adjustment reason is inactive');
      }

      if (reason.reason_type !== 'Stock Adjustment') {
        throw new ConflictException(
          'Reason must be a Stock Adjustment reason',
        );
      }

      // Row-level lock: under concurrent adjustments on the same sku/location, the second
      // transaction blocks here until the first commits or rolls back, instead of both
      // reading a stale quantity and racing a lost update on the later UPDATE.
      const existingRows = await tx.$queryRaw<
        { id: string; quantity: number }[]
      >`
        SELECT id, quantity FROM inventory_stock
        WHERE sku_id = ${dto.sku_id}::uuid AND location_id = ${dto.location_id}::uuid
        FOR UPDATE
      `;
      const existing = existingRows[0];

      const quantityBefore = existing?.quantity ?? 0;
      const quantityAfter = dto.quantity;

      if (quantityBefore === quantityAfter) {
        throw new ConflictException(
          'Adjustment quantity is the same as current stock',
        );
      }

      const quantityChange = quantityAfter - quantityBefore;

      let stock;

      if (existing) {
        stock = await tx.inventory_stock.update({
          where: { id: existing.id },
          data: {
            quantity: quantityAfter,
            updated_at: new Date(),
          },
        });
      } else {
        try {
          stock = await tx.inventory_stock.create({
            data: {
              sku_id: dto.sku_id,
              location_id: dto.location_id,
              quantity: quantityAfter,
            },
          });
        } catch (error) {
          // Another transaction inserted the same sku/location row first (unique
          // constraint); the DB itself prevented the duplicate atomically. No partial
          // state was committed here, so it's safe to ask the caller to retry.
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) {
            throw new ConflictException(
              'Stock row was concurrently initialized for this SKU/location; please retry the adjustment',
            );
          }
          throw error;
        }
      }

      const movement = await tx.inventory_movements.create({
        data: {
          sku_id: dto.sku_id,
          location_id: dto.location_id,
          movement_type: 'Adjustment',
          quantity_change: quantityChange,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          reference_type: 'Stock Adjustment',
          reference_id: null,
          reason: reason.reason_name,
        },
      });

      return {
        stock,
        movement,
        sku,
        location,
        reason,
      };
    });
  }
}
