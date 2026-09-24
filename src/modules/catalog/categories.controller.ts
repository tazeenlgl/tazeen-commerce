import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { product_status } from '@prisma/client';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('catalog/categories')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @RequirePermission('catalog.category.read')
  findAll(@Query('status') status?: product_status) {
    return this.categoriesService.findAll(status);
  }

  @Get(':id')
  @RequirePermission('catalog.category.read')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @RequirePermission('catalog.category.create')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('catalog.category.update')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }
}
