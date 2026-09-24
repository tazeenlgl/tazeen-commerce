import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findStock(params: {
    skuId?: string;
    locationId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where = {
      ...(params.skuId ? { sku_id: params.skuId } : {}),
      ...(params.locationId ? { location_id: params.locationId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.inventory_stock.findMany({
        where,
        include: {
          product_skus: {
            include: {
              products: {
                select: {
                  id: true,
                  product_id: true,
                  product_name: true,
                  core_sku: true,
                  status: true,
                },
              },
            },
          },
          locations: {
            select: {
              id: true,
              location_code: true,
              location_name: true,
              location_type: true,
              status: true,
            },
          },
        },
        orderBy: [{ updated_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inventory_stock.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        sku_id: item.sku_id,
        sku: item.product_skus.sku,
        product: item.product_skus.products,
        location: item.locations,
        quantity: item.quantity,
        status: this.getStockStatus(item.quantity),
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findStockOne(skuId: string, locationId: string) {
    const item = await this.prisma.inventory_stock.findUnique({
      where: {
        sku_id_location_id: {
          sku_id: skuId,
          location_id: locationId,
        },
      },
      include: {
        product_skus: {
          include: {
            products: {
              select: {
                id: true,
                product_id: true,
                product_name: true,
                core_sku: true,
                status: true,
              },
            },
          },
        },
        locations: {
          select: {
            id: true,
            location_code: true,
            location_name: true,
            location_type: true,
            status: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Stock record not found');
    }

    return {
      id: item.id,
      sku_id: item.sku_id,
      sku: item.product_skus.sku,
      product: item.product_skus.products,
      location: item.locations,
      quantity: item.quantity,
      status: this.getStockStatus(item.quantity),
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  async findMovements(params: {
    skuId?: string;
    locationId?: string;
    movementType?: string;
    referenceType?: string;
    referenceId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 100);

    const where = {
      ...(params.skuId ? { sku_id: params.skuId } : {}),
      ...(params.locationId ? { location_id: params.locationId } : {}),
      ...(params.movementType ? { movement_type: params.movementType as any } : {}),
      ...(params.referenceType ? { reference_type: params.referenceType } : {}),
      ...(params.referenceId ? { reference_id: params.referenceId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.inventory_movements.findMany({
        where,
        include: {
          product_skus: {
            select: {
              id: true,
              sku: true,
              product_id: true,
            },
          },
          locations: {
            select: {
              id: true,
              location_code: true,
              location_name: true,
              location_type: true,
            },
          },
        },
        orderBy: [{ created_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inventory_movements.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  private getStockStatus(quantity: number) {
    if (quantity === 0) return 'Out';
    if (quantity <= 2) return 'Low';
    return 'In Stock';
  }
}
