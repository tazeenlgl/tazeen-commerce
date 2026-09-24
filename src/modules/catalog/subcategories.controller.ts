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

@Controller('catalog/subcategories')
@UseGuards(SessionAuthGuard)
export class SubcategoriesController {
  constructor(
    private readonly subcategoriesService: SubcategoriesService,
  ) {}

  @Get()
  findAll(
    @Query('category_id') categoryId?: string,
    @Query('status') status?: product_status,
  ) {
    return this.subcategoriesService.findAll(categoryId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoriesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSubcategoryDto) {
    return this.subcategoriesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSubcategoryDto,
  ) {
    return this.subcategoriesService.update(id, dto);
  }
}
