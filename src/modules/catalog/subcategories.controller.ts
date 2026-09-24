import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { product_status } from '@prisma/client';
import { SubcategoriesService } from './subcategories.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('catalog/subcategories')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class SubcategoriesController {
  constructor(
    private readonly subcategoriesService: SubcategoriesService,
  ) {}

  @Get()
  @RequirePermission('catalog.subcategory.read')
  findAll(
    @Query('category_id') categoryId?: string,
    @Query('status') status?: product_status,
  ) {
    return this.subcategoriesService.findAll(categoryId, status);
  }

  @Get(':id')
  @RequirePermission('catalog.subcategory.read')
  findOne(@Param('id') id: string) {
    return this.subcategoriesService.findOne(id);
  }

  @Post()
  @RequirePermission('catalog.subcategory.create')
  create(@Body() dto: CreateSubcategoryDto) {
    return this.subcategoriesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('catalog.subcategory.update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSubcategoryDto,
  ) {
    return this.subcategoriesService.update(id, dto);
  }
}
