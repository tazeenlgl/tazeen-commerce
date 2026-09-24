import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletTransactionDto } from './dto/wallet-transaction.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('customers/:customerId/wallet')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @RequirePermission('customer.wallet.read')
  getBalance(@Param('customerId') customerId: string) {
    return this.walletService.getBalance(customerId);
  }

  @Get('transactions')
  @RequirePermission('customer.wallet.read')
  listTransactions(@Param('customerId') customerId: string) {
    return this.walletService.listTransactions(customerId);
  }

  @Post('credit')
  @RequirePermission('customer.wallet.credit')
  credit(@Param('customerId') customerId: string, @Body() dto: WalletTransactionDto) {
    return this.walletService.credit(customerId, dto);
  }

  @Post('debit')
  @RequirePermission('customer.wallet.debit')
  debit(@Param('customerId') customerId: string, @Body() dto: WalletTransactionDto) {
    return this.walletService.debit(customerId, dto);
  }
}
