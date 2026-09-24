import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { product_status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: product_status) {
    return this.prisma.product_categories.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ category_name: 'asc' }],
      include: {
        _count: {
          select: {
            product_subcategories: true,
            products: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.product_categories.findUnique({
      where: { id },
      include: {
        product_subcategories: {
          orderBy: [{ subcategory_name: 'asc' }],
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.product_categories.create({
        data: {
          category_code: dto.category_code.trim(),
          category_name: dto.category_name.trim(),
          description: dto.description?.trim() || null,
          status: dto.status === 'Inactive'
            ? product_status.Inactive
            : product_status.Active,
        },
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Category code or name already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    try {
      return await this.prisma.product_categories.update({
        where: { id },
        data: {
          ...(dto.category_code !== undefined
            ? { category_code: dto.category_code.trim() }
            : {}),
          ...(dto.category_name !== undefined
            ? { category_name: dto.category_name.trim() }
            : {}),
          ...(dto.description !== undefined
            ? { description: dto.description.trim() || null }
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
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Category code or name already exists');
      }
      throw error;
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
