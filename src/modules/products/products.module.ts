import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SkuAttributesController } from './sku-attributes.controller';
import { SkuAttributesService } from './sku-attributes.service';
import { SkusController } from './skus.controller';
import { SkusService } from './skus.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    ProductsController,
    SkusController,
    SkuAttributesController,
  ],
  providers: [
    ProductsService,
    SkusService,
    SkuAttributesService,
  ],
  exports: [
    ProductsService,
    SkusService,
    SkuAttributesService,
  ],
})
export class ProductsModule {}
