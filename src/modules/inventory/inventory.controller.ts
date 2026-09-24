import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateAdjustmentDto } from './create-adjustment.dto';
import { InventoryAdjustmentService } from './inventory-adjustment.service';
import { InventoryService } from './inventory.service';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('inventory')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly inventoryAdjustmentService: InventoryAdjustmentService,
  ) {}

  @Get('stock')
  @RequirePermission('inventory.stock.read')
  findStock(
    @Query('sku_id') skuId?: string,
    @Query('location_id') locationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.findStock({
      skuId,
      locationId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('stock/:skuId/:locationId')
  @RequirePermission('inventory.stock.read')
  findStockOne(
    @Param('skuId') skuId: string,
    @Param('locationId') locationId: string,
  ) {
    return this.inventoryService.findStockOne(skuId, locationId);
  }

  @Post('adjustments')
  @RequirePermission('inventory.adjust')
  createAdjustment(@Body() dto: CreateAdjustmentDto) {
    return this.inventoryAdjustmentService.create(dto);
  }

  @Get('movements')
  @RequirePermission('inventory.movement.read')
  findMovements(
    @Query('sku_id') skuId?: string,
    @Query('location_id') locationId?: string,
    @Query('movement_type') movementType?: string,
    @Query('reference_type') referenceType?: string,
    @Query('reference_id') referenceId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.findMovements({
      skuId,
      locationId,
      movementType,
      referenceType,
      referenceId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
