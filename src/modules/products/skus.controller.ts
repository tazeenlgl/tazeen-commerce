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
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('catalog/products/:productId/skus')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class SkusController {
  constructor(private readonly skusService: SkusService) {}

  @Get()
  @RequirePermission('sku.read')
  findAll(
    @Param('productId') productId: string,
    @Query('status') status?: sku_status,
  ) {
    return this.skusService.findAll(productId, status);
  }

  @Get(':skuId')
  @RequirePermission('sku.read')
  findOne(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
  ) {
    return this.skusService.findOne(productId, skuId);
  }

  @Post()
  @RequirePermission('sku.create')
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateSkuDto,
  ) {
    return this.skusService.create(productId, dto);
  }

  @Patch(':skuId')
  @RequirePermission('sku.update')
  update(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Body() dto: UpdateSkuDto,
  ) {
    return this.skusService.update(productId, skuId, dto);
  }
}
