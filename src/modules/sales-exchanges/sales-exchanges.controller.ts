import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SalesExchangesService } from './sales-exchanges.service';
import { CreateSalesExchangeDto } from './dto/create-sales-exchange.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('sales-exchanges')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class SalesExchangesController {
  constructor(private readonly salesExchangesService: SalesExchangesService) {}

  @Get()
  @RequirePermission('sales.exchange.read')
  findAll(
    @Query('customer_id') customerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesExchangesService.findAll({
      customerId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('sales.exchange.read')
  findOne(@Param('id') id: string) {
    return this.salesExchangesService.findOne(id);
  }

  @Post()
  @RequirePermission('sales.exchange.create')
  create(@Body() dto: CreateSalesExchangeDto) {
    return this.salesExchangesService.create(dto);
  }
}
