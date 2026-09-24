import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SalesExchangesController } from './sales-exchanges.controller';
import { SalesExchangesService } from './sales-exchanges.service';

@Module({
  imports: [PrismaModule],
  controllers: [SalesExchangesController],
  providers: [SalesExchangesService],
  exports: [SalesExchangesService],
})
export class SalesExchangesModule {}
