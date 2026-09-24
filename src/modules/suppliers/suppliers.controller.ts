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
import { SessionAuthGuard } from '../../auth/session-auth.guard';
import { PermissionGuard } from '../../auth/permissions/permission.guard';
import { RequirePermission } from '../../auth/permissions/require-permission.decorator';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateSupplierAddressDto } from './dto/create-supplier-address.dto';
import { UpdateSupplierAddressDto } from './dto/update-supplier-address.dto';
import { CreateSupplierBankAccountDto } from './dto/create-supplier-bank-account.dto';
import { UpdateSupplierBankAccountDto } from './dto/update-supplier-bank-account.dto';
import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
@UseGuards(SessionAuthGuard, PermissionGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermission('supplier.read')
  findAll(
    @Query('status') status?: string,
    @Query('supplier_type') supplierType?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.suppliersService.findAll({
      status,
      supplierType,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post()
  @RequirePermission('supplier.create')
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('supplier.update')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Get(':id')
  @RequirePermission('supplier.read')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Get('\:supplierId/addresses')
  @RequirePermission('supplier.address.read')
  findAddresses(@Param('supplierId') supplierId: string) {
    return this.suppliersService.findAddresses(supplierId);
  }

  @Post('\:supplierId/addresses')
  @RequirePermission('supplier.address.create')
  createAddress(
    @Param('supplierId') supplierId: string,
    @Body() dto: CreateSupplierAddressDto,
  ) {
    return this.suppliersService.createAddress(supplierId, dto);
  }

  @Patch('\:supplierId/addresses/\:addressId')
  @RequirePermission('supplier.address.update')
  updateAddress(
    @Param('supplierId') supplierId: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateSupplierAddressDto,
  ) {
    return this.suppliersService.updateAddress(
      supplierId,
      addressId,
      dto,
    );
  }

  @Get('\:supplierId/bank-accounts')
  @RequirePermission('supplier.bank_account.read')
  findBankAccounts(@Param('supplierId') supplierId: string) {
    return this.suppliersService.findBankAccounts(supplierId);
  }

  @Post('\:supplierId/bank-accounts')
  @RequirePermission('supplier.bank_account.create')
  createBankAccount(
    @Param('supplierId') supplierId: string,
    @Body() dto: CreateSupplierBankAccountDto,
  ) {
    return this.suppliersService.createBankAccount(
      supplierId,
      dto,
    );
  }

  @Patch('\:supplierId/bank-accounts/\:bankAccountId')
  @RequirePermission('supplier.bank_account.update')
  updateBankAccount(
    @Param('supplierId') supplierId: string,
    @Param('bankAccountId') bankAccountId: string,
    @Body() dto: UpdateSupplierBankAccountDto,
  ) {
    return this.suppliersService.updateBankAccount(
      supplierId,
      bankAccountId,
      dto,
    );
  }

}
