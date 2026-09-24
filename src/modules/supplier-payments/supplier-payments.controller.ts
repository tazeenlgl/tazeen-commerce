import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SupplierPaymentsService } from './supplier-payments.service';
import { CreateSupplierPaymentDto } from './dto/create-supplier-payment.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('suppliers/:supplierId')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class SupplierPaymentsController {
  constructor(private readonly supplierPaymentsService: SupplierPaymentsService) {}

  @Post('payments')
  @RequirePermission('supplier.payment.create')
  createPayment(@Param('supplierId') supplierId: string, @Body() dto: CreateSupplierPaymentDto) {
    return this.supplierPaymentsService.createPayment(supplierId, dto);
  }

  @Get('payments')
  @RequirePermission('supplier.payment.read')
  listPayments(
    @Param('supplierId') supplierId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.supplierPaymentsService.listPayments(supplierId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('ledger')
  @RequirePermission('supplier.ledger.read')
  listLedger(
    @Param('supplierId') supplierId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.supplierPaymentsService.listLedger(supplierId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('balance')
  @RequirePermission('supplier.ledger.read')
  getBalance(@Param('supplierId') supplierId: string) {
    return this.supplierPaymentsService.getBalance(supplierId);
  }
}
