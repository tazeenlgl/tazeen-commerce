import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TransactionReasonsController } from './transaction-reasons.controller';
import { TransactionReasonsService } from './transaction-reasons.service';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionReasonsController],
  providers: [TransactionReasonsService],
  exports: [TransactionReasonsService],
})
export class TransactionReasonsModule {}
