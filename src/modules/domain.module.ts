import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { CatalogModule } from './catalog/catalog.module';
import { ProductsModule } from './products/products.module';
import { VariantsModule } from './variants/variants.module';
import { SkuModule } from './sku/sku.module';
import { InventoryModule } from './inventory/inventory.module';
import { LocationsModule } from './locations/locations.module';
import { SalesModule } from './sales/sales.module';
import { InvoicesModule } from './invoices/invoices.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { WalletModule } from './wallet/wallet.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EngagementModule } from './engagement/engagement.module';
import { AuditModule } from './audit/audit.module';

const MODULES = [
  IdentityModule,
  AuthModule,
  CustomersModule,
  CatalogModule,
  ProductsModule,
  VariantsModule,
  SkuModule,
  InventoryModule,
  LocationsModule,
  SalesModule,
  InvoicesModule,
  OrdersModule,
  PaymentsModule,
  WalletModule,
  NotificationsModule,
  EngagementModule,
  AuditModule,
];

@Module({ imports: MODULES })
export class DomainModule {}
