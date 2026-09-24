import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('reports')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-register')
  @RequirePermission('report.sales.read')
  salesRegister(
    @Query('from_date') fromDate: string,
    @Query('to_date') toDate: string,
    @Query('location_id') locationId?: string,
    @Query('gst_rate') gstRate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.salesRegister({
      fromDate,
      toDate,
      locationId,
      gstRate: gstRate !== undefined ? Number(gstRate) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('gst-summary')
  @RequirePermission('report.gst.read')
  gstSummary(
    @Query('from_date') fromDate: string,
    @Query('to_date') toDate: string,
    @Query('location_id') locationId?: string,
    @Query('gst_rate') gstRate?: string,
  ) {
    return this.reportsService.gstSummary({
      fromDate,
      toDate,
      locationId,
      gstRate: gstRate !== undefined ? Number(gstRate) : undefined,
    });
  }
}
