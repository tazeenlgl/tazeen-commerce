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
import { CreateTransactionReasonDto } from './create-transaction-reason.dto';
import { TransactionReasonsService } from './transaction-reasons.service';
import { UpdateTransactionReasonDto } from './update-transaction-reason.dto';
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';

@Controller('transaction-reasons')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class TransactionReasonsController {
  constructor(
    private readonly transactionReasonsService: TransactionReasonsService,
  ) {}

  @Get()
  @RequirePermission('transaction_reason.read')
  findAll(
    @Query('reason_type') reasonType?: string,
    @Query('is_active') isActive?: string,
  ) {
    const active =
      isActive === undefined
        ? undefined
        : isActive === 'true'
          ? true
          : isActive === 'false'
            ? false
            : undefined;

    return this.transactionReasonsService.findAll(reasonType, active);
  }

  @Get(':id')
  @RequirePermission('transaction_reason.read')
  findOne(@Param('id') id: string) {
    return this.transactionReasonsService.findOne(id);
  }

  @Post()
  @RequirePermission('transaction_reason.create')
  create(@Body() dto: CreateTransactionReasonDto) {
    return this.transactionReasonsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('transaction_reason.update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionReasonDto,
  ) {
    return this.transactionReasonsService.update(id, dto);
  }
}
