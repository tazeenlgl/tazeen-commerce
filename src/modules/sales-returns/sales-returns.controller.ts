import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SalesReturnsService } from './sales-returns.service';
import { CreateSalesReturnDto } from './dto/create-sales-return.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('sales-returns')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class SalesReturnsController {
  constructor(private readonly salesReturnsService: SalesReturnsService) {}

  @Get()
  @RequirePermission('sales.return.read')
  findAll(
    @Query('customer_id') customerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesReturnsService.findAll({
      customerId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('sales.return.read')
  findOne(@Param('id') id: string) {
    return this.salesReturnsService.findOne(id);
  }

  @Post()
  @RequirePermission('sales.return.create')
  create(@Body() dto: CreateSalesReturnDto) {
    return this.salesReturnsService.create(dto);
  }
}
