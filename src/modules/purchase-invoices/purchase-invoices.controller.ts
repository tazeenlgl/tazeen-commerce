import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchaseInvoicesService } from './purchase-invoices.service';
import { CreatePurchaseInvoiceDto } from './dto/create-purchase-invoice.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('purchase-invoices')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class PurchaseInvoicesController {
  constructor(
    private readonly purchaseInvoicesService: PurchaseInvoicesService,
  ) {}

  @Get()
  @RequirePermission('purchase.read')
  findAll(
    @Query('supplier_id') supplierId?: string,
    @Query('status') status?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.purchaseInvoicesService.findAll({
      supplierId,
      status,
      fromDate,
      toDate,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post()
  @RequirePermission('purchase.create')
  create(@Body() dto: CreatePurchaseInvoiceDto) {
    return this.purchaseInvoicesService.create(dto);
  }

  @Post(':id/receive')
  @RequirePermission('purchase.receive')
  receive(@Param('id') id: string) {
    return this.purchaseInvoicesService.receive(id);
  }

  @Get(':id')
  @RequirePermission('purchase.read')
  findOne(@Param('id') id: string) {
    return this.purchaseInvoicesService.findOne(id);
  }
}
