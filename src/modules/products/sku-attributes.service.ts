import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkuAttributeDto } from './create-sku-attribute.dto';

@Injectable()
export class SkuAttributesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(productId: string, skuId: string) {
    await this.ensureSkuBelongsToProduct(productId, skuId);

    return this.prisma.product_sku_attributes.findMany({
      where: {
        sku_id: skuId,
      },
      orderBy: [
        { attribute_name: 'asc' },
        { attribute_value: 'asc' },
      ],
    });
  }

  async create(
    productId: string,
    skuId: string,
    dto: CreateSkuAttributeDto,
  ) {
    await this.ensureSkuBelongsToProduct(productId, skuId);

    try {
      return await this.prisma.product_sku_attributes.create({
        data: {
          sku_id: skuId,
          attribute_name: dto.attribute_name.trim(),
          attribute_value: dto.attribute_value.trim(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This attribute name and value already exists for the SKU',
        );
      }

      throw error;
    }
  }

  async remove(
    productId: string,
    skuId: string,
    attributeId: string,
  ) {
    await this.ensureSkuBelongsToProduct(productId, skuId);

    const attribute =
      await this.prisma.product_sku_attributes.findFirst({
        where: {
          id: attributeId,
          sku_id: skuId,
        },
        select: {
          id: true,
        },
      });

    if (!attribute) {
      throw new NotFoundException('SKU attribute not found');
    }

    await this.prisma.product_sku_attributes.delete({
      where: {
        id: attributeId,
      },
    });

    return {
      success: true,
      id: attributeId,
    };
  }

  private async ensureSkuBelongsToProduct(
    productId: string,
    skuId: string,
  ) {
    const sku = await this.prisma.product_skus.findFirst({
      where: {
        id: skuId,
        product_id: productId,
      },
      select: {
        id: true,
      },
    });

    if (!sku) {
      throw new NotFoundException('SKU not found');
    }
  }
}
