import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { product_status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubcategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categoryId?: string, status?: product_status) {
    return this.prisma.product_subcategories.findMany({
      where: {
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: [{ subcategory_name: 'asc' }],
      include: {
        product_categories: {
          select: {
            id: true,
            category_code: true,
            category_name: true,
            status: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const subcategory = await this.prisma.product_subcategories.findUnique({
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
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    return subcategory;
  }

  async create(dto: CreateSubcategoryDto) {
    await this.ensureCategoryExists(dto.category_id);

    try {
      return await this.prisma.product_subcategories.create({
        data: {
          category_id: dto.category_id,
          subcategory_code: dto.subcategory_code.trim(),
          subcategory_name: dto.subcategory_name.trim(),
          status:
            dto.status === 'Inactive'
              ? product_status.Inactive
              : product_status.Active,
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
        },
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'Subcategory code or name already exists',
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSubcategoryDto) {
    await this.findOne(id);

    if (dto.category_id !== undefined) {
      await this.ensureCategoryExists(dto.category_id);
    }

    try {
      return await this.prisma.product_subcategories.update({
        where: { id },
        data: {
          ...(dto.category_id !== undefined
            ? { category_id: dto.category_id }
            : {}),
          ...(dto.subcategory_code !== undefined
            ? { subcategory_code: dto.subcategory_code.trim() }
            : {}),
          ...(dto.subcategory_name !== undefined
            ? { subcategory_name: dto.subcategory_name.trim() }
            : {}),
          ...(dto.status !== undefined
            ? {
                status:
                  dto.status === 'Inactive'
                    ? product_status.Inactive
                    : product_status.Active,
              }
            : {}),
          updated_at: new Date(),
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
        },
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'Subcategory code or name already exists',
        );
      }
      throw error;
    }
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

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
