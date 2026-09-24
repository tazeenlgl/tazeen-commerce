import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InventoryTransfersService } from './inventory-transfers.service';
import { CreateInventoryTransferDto } from './dto/create-inventory-transfer.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('inventory-transfers')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class InventoryTransfersController {
  constructor(private readonly inventoryTransfersService: InventoryTransfersService) {}

  @Get()
  @RequirePermission('inventory.transfer.read')
  findAll(
    @Query('source_location_id') sourceLocationId?: string,
    @Query('destination_location_id') destinationLocationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryTransfersService.findAll({
      sourceLocationId,
      destinationLocationId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('inventory.transfer.read')
  findOne(@Param('id') id: string) {
    return this.inventoryTransfersService.findOne(id);
  }

  @Post()
  @RequirePermission('inventory.transfer.create')
  create(@Body() dto: CreateInventoryTransferDto) {
    return this.inventoryTransfersService.create(dto);
  }

  @Post(':id/approve')
  @RequirePermission('inventory.transfer.approve')
  approve(@Param('id') id: string) {
    return this.inventoryTransfersService.approve(id);
  }

  @Post(':id/reverse')
  @RequirePermission('inventory.transfer.reverse')
  reverse(@Param('id') id: string) {
    return this.inventoryTransfersService.reverse(id);
  }
}
