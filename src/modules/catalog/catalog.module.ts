import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { SubcategoriesController } from './subcategories.controller';
import { SubcategoriesService } from './subcategories.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController, SubcategoriesController],
  providers: [CategoriesService, SubcategoriesService],
  exports: [CategoriesService, SubcategoriesService],
})
export class CatalogModule {}
