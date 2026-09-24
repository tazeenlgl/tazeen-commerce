import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryAdjustmentService } from './inventory-adjustment.service';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryAdjustmentService],
  exports: [InventoryService, InventoryAdjustmentService],
})
export class InventoryModule {}
