import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Prisma, product_status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    status?: product_status,
    categoryId?: string,
    subcategoryId?: string,
    supplierId?: string,
  ) {
    return this.prisma.products.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(subcategoryId ? { subcategory_id: subcategoryId } : {}),
        ...(supplierId ? { supplier_id: supplierId } : {}),
      },
      include: {
        product_categories: {
          select: {
            id: true,
            category_code: true,
            category_name: true,
            status: true,
          },
        },
        product_subcategories: {
          select: {
            id: true,
            subcategory_code: true,
            subcategory_name: true,
            status: true,
          },
        },
        suppliers: {
          select: {
            id: true,
            supplierCode: true,
            supplierName: true,
            status: true,
          },
        },
        _count: {
          select: {
            product_skus: true,
          },
        },
      },
      orderBy: {
        product_name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.products.findUnique({
      where: { id },
      include: {
        product_categories: {
          select: {
            id: true,
            category_code: true,
            category_name: true,
            status: true,
          },
        },
        product_subcategories: {
          select: {
            id: true,
            subcategory_code: true,
            subcategory_name: true,
            status: true,
          },
        },
        suppliers: {
          select: {
            id: true,
            supplierCode: true,
            supplierName: true,
            status: true,
          },
        },
        _count: {
          select: {
            product_skus: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const categoryId = dto.category_id;
    const subcategoryId = dto.subcategory_id;
    const supplierId = dto.supplier_id;

    await this.ensureCategoryExists(categoryId);

    if (subcategoryId) {
      await this.ensureSubcategoryBelongsToCategory(
        subcategoryId,
        categoryId,
      );
    }

    if (supplierId) {
      await this.ensureSupplierExists(supplierId);
    }

    try {
      return await this.prisma.products.create({
        data: {
          product_id: dto.product_id.trim(),
          core_sku: dto.core_sku.trim(),
          product_name: dto.product_name.trim(),
          category_id: categoryId,
          subcategory_id: subcategoryId,
          supplier_id: supplierId,
          brand: this.cleanOptional(dto.brand),
          hsn: this.cleanOptional(dto.hsn),
          gst_rate: new Prisma.Decimal(dto.gst_rate),
          purchase_rate: new Prisma.Decimal(dto.purchase_rate),
          ...(dto.status ? { status: dto.status as product_status } : {}),
        },
        include: this.responseInclude(),
      });
    } catch (error) {
      this.handleUniqueViolation(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.products.findUnique({
      where: { id },
      select: {
        id: true,
        category_id: true,
        subcategory_id: true,
        supplier_id: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const categoryId = dto.category_id ?? existing.category_id;
    const subcategoryId =
      dto.subcategory_id !== undefined
        ? dto.subcategory_id
        : existing.subcategory_id;

    if (dto.category_id !== undefined) {
      await this.ensureCategoryExists(categoryId);
    }

    if (subcategoryId) {
      await this.ensureSubcategoryBelongsToCategory(
        subcategoryId,
        categoryId,
      );
    }

    if (dto.supplier_id !== undefined && dto.supplier_id !== null) {
      await this.ensureSupplierExists(dto.supplier_id);
    }

    try {
      return await this.prisma.products.update({
        where: { id },
        data: {
          ...(dto.product_id !== undefined
            ? { product_id: dto.product_id.trim() }
            : {}),
          ...(dto.core_sku !== undefined
            ? { core_sku: dto.core_sku.trim() }
            : {}),
          ...(dto.product_name !== undefined
            ? { product_name: dto.product_name.trim() }
            : {}),
          ...(dto.category_id !== undefined
            ? { category_id: categoryId }
            : {}),
          ...(dto.subcategory_id !== undefined
            ? { subcategory_id: dto.subcategory_id }
            : {}),
          ...(dto.supplier_id !== undefined
            ? { supplier_id: dto.supplier_id }
            : {}),
          ...(dto.brand !== undefined
            ? { brand: this.cleanOptional(dto.brand) }
            : {}),
          ...(dto.hsn !== undefined
            ? { hsn: this.cleanOptional(dto.hsn) }
            : {}),
          ...(dto.gst_rate !== undefined
            ? { gst_rate: new Prisma.Decimal(dto.gst_rate) }
            : {}),
          ...(dto.purchase_rate !== undefined
            ? { purchase_rate: new Prisma.Decimal(dto.purchase_rate) }
            : {}),
          ...(dto.status !== undefined
            ? { status: dto.status as product_status }
            : {}),
          updated_at: new Date(),
        },
        include: this.responseInclude(),
      });
    } catch (error) {
      this.handleUniqueViolation(error);
      throw error;
    }
  }

  private responseInclude() {
    return {
      product_categories: {
        select: {
          id: true,
          category_code: true,
          category_name: true,
          status: true,
        },
      },
      product_subcategories: {
        select: {
          id: true,
          subcategory_code: true,
          subcategory_name: true,
          status: true,
        },
      },
      suppliers: {
        select: {
          id: true,
          supplierCode: true,
          supplierName: true,
          status: true,
        },
      },
      _count: {
        select: {
          product_skus: true,
        },
      },
    };
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.product_categories.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private async ensureSubcategoryBelongsToCategory(
    subcategoryId: string,
    categoryId: string,
  ) {
    const subcategory =
      await this.prisma.product_subcategories.findUnique({
        where: { id: subcategoryId },
        select: {
          id: true,
          category_id: true,
        },
      });

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    if (subcategory.category_id !== categoryId) {
      throw new BadRequestException(
        'Subcategory does not belong to the selected category',
      );
    }
  }

  private async ensureSupplierExists(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
  }

  private cleanOptional(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private handleUniqueViolation(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Product ID or core SKU already exists',
      );
    }
  }
}
