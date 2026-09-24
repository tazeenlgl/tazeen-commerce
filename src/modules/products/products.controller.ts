import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { product_status } from '@prisma/client';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';
import { ProductsService } from './products.service';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('catalog/products')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission('product.read')
  findAll(
    @Query('status') status?: product_status,
    @Query('category_id') categoryId?: string,
    @Query('subcategory_id') subcategoryId?: string,
    @Query('supplier_id') supplierId?: string,
  ) {
    return this.productsService.findAll(
      status,
      categoryId,
      subcategoryId,
      supplierId,
    );
  }

  @Get(':id')
  @RequirePermission('product.read')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @RequirePermission('product.create')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('product.update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }
}
