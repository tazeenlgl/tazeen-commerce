import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration, { validateEnv } from './config/configuration';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { SecurityModule } from './security/security.module';
import { DomainModule } from './modules/domain.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TransactionReasonsModule } from './modules/transaction-reasons/transaction-reasons.module';
import { PurchaseInvoicesModule } from './modules/purchase-invoices/purchase-invoices.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { SupplierPaymentsModule } from './modules/supplier-payments/supplier-payments.module';
import { PurchaseReturnsModule } from './modules/purchase-returns/purchase-returns.module';
import { InventoryTransfersModule } from './modules/inventory-transfers/inventory-transfers.module';
import { PermissionsModule } from './auth/permissions/permissions.module';
import { AuditModule } from './auth/audit/audit.module';

// Future (not added yet): ThrottlerModule (rate limiting), Redis cache module,
// background-jobs module (queues), timeout interceptor.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    SecurityModule,
    PrismaModule,
    HealthModule,
    DomainModule,
    InventoryModule,
    TransactionReasonsModule,
    PurchaseInvoicesModule,
    SuppliersModule,
    SupplierPaymentsModule,
    PurchaseReturnsModule,
    InventoryTransfersModule,
    AuthModule,
    PermissionsModule,
    AuditModule,
  ],
})
export class AppModule {}
