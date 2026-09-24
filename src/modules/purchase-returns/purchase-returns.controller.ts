import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PurchaseReturnsService } from './purchase-returns.service';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('purchase-returns')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class PurchaseReturnsController {
  constructor(private readonly purchaseReturnsService: PurchaseReturnsService) {}

  @Get()
  @RequirePermission('purchase.return.read')
  findAll(
    @Query('supplier_id') supplierId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.purchaseReturnsService.findAll({
      supplierId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('purchase.return.read')
  findOne(@Param('id') id: string) {
    return this.purchaseReturnsService.findOne(id);
  }

  @Post()
  @RequirePermission('purchase.return.create')
  create(@Body() dto: CreatePurchaseReturnDto) {
    return this.purchaseReturnsService.create(dto);
  }
}
