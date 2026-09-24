import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

      const existing = await tx.inventory_stock.findUnique({
        where: {
          sku_id_location_id: {
            sku_id: dto.sku_id,
            location_id: dto.location_id,
          },
        },
        select: {
          id: true,
          quantity: true,
        },
      });

      const quantityBefore = existing?.quantity ?? 0;
      const quantityAfter = dto.quantity;

      if (quantityBefore === quantityAfter) {
        throw new ConflictException(
          'Adjustment quantity is the same as current stock',
        );
      }

      const quantityChange = quantityAfter - quantityBefore;

      const stock = existing
        ? await tx.inventory_stock.update({
            where: { id: existing.id },
            data: {
              quantity: quantityAfter,
              updated_at: new Date(),
            },
          })
        : await tx.inventory_stock.create({
            data: {
              sku_id: dto.sku_id,
              location_id: dto.location_id,
              quantity: quantityAfter,
            },
          });

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
