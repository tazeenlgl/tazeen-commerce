import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, sku_status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkuDto } from './create-sku.dto';
import { UpdateSkuDto } from './update-sku.dto';

@Injectable()
export class SkusService {
  constructor(private readonly prisma: PrismaService) {}

  private responseInclude() {
    return {
      products: {
        select: {
          id: true,
          product_id: true,
          core_sku: true,
          product_name: true,
          status: true,
        },
      },
      _count: {
        select: {
          product_sku_attributes: true,
          inventory_stock: true,
        },
      },
    } satisfies Prisma.product_skusInclude;
  }

  async findAll(productId: string, status?: sku_status) {
    await this.ensureProductExists(productId);

    return this.prisma.product_skus.findMany({
      where: {
        product_id: productId,
        ...(status ? { status } : {}),
      },
      include: this.responseInclude(),
      orderBy: {
        sequence_no: 'asc',
      },
    });
  }

  async findOne(productId: string, skuId: string) {
    const sku = await this.prisma.product_skus.findFirst({
      where: {
        id: skuId,
        product_id: productId,
      },
      include: this.responseInclude(),
    });

    if (!sku) {
      throw new NotFoundException('SKU not found');
    }

    return sku;
  }

  async create(productId: string, dto: CreateSkuDto) {
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'Active') {
      throw new BadRequestException(
        'Cannot create SKU for an inactive product',
      );
    }

    try {
      return await this.prisma.product_skus.create({
        data: {
          product_id: productId,
          sku: dto.sku.trim(),
          sequence_no: dto.sequence_no,
          mrp: dto.mrp,
          ...(dto.status ? { status: dto.status } : {}),
        },
        include: this.responseInclude(),
      });
    } catch (error) {
      this.handleUniqueViolation(error);
      throw error;
    }
  }

  async update(
    productId: string,
    skuId: string,
    dto: UpdateSkuDto,
  ) {
    const existing = await this.prisma.product_skus.findFirst({
      where: {
        id: skuId,
        product_id: productId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('SKU not found');
    }

    try {
      return await this.prisma.product_skus.update({
        where: {
          id: skuId,
        },
        data: {
          ...(dto.mrp !== undefined ? { mrp: dto.mrp } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          updated_at: new Date(),
        },
        include: this.responseInclude(),
      });
    } catch (error) {
      this.handleUniqueViolation(error);
      throw error;
    }
  }

  private async ensureProductExists(productId: string) {
    const product = await this.prisma.products.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private handleUniqueViolation(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'SKU or sequence number already exists',
      );
    }
  }
}
