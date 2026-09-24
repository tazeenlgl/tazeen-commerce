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
import { sku_status } from '@prisma/client';
import { CreateSkuDto } from './create-sku.dto';
import { UpdateSkuDto } from './update-sku.dto';
import { SkusService } from './skus.service';
import { SessionAuthGuard } from '../../auth/session-auth.guard';

@Controller('catalog/products/:productId/skus')
@UseGuards(SessionAuthGuard)
export class SkusController {
  constructor(private readonly skusService: SkusService) {}

  @Get()
  findAll(
    @Param('productId') productId: string,
    @Query('status') status?: sku_status,
  ) {
    return this.skusService.findAll(productId, status);
  }

  @Get(':skuId')
  findOne(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
  ) {
    return this.skusService.findOne(productId, skuId);
  }

  @Post()
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateSkuDto,
  ) {
    return this.skusService.create(productId, dto);
  }

  @Patch(':skuId')
  update(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Body() dto: UpdateSkuDto,
  ) {
    return this.skusService.update(productId, skuId, dto);
  }
}
