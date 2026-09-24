import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateSkuAttributeDto } from './create-sku-attribute.dto';
import { SkuAttributesService } from './sku-attributes.service';
import { SessionAuthGuard } from '../../auth/session-auth.guard';

@Controller(
  'catalog/products/:productId/skus/:skuId/attributes',
)
@UseGuards(SessionAuthGuard)
export class SkuAttributesController {
  constructor(
    private readonly skuAttributesService: SkuAttributesService,
  ) {}

  @Get()
  findAll(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
  ) {
    return this.skuAttributesService.findAll(
      productId,
      skuId,
    );
  }

  @Post()
  create(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Body() dto: CreateSkuAttributeDto,
  ) {
    return this.skuAttributesService.create(
      productId,
      skuId,
      dto,
    );
  }

  @Delete(':attributeId')
  remove(
    @Param('productId') productId: string,
    @Param('skuId') skuId: string,
    @Param('attributeId') attributeId: string,
  ) {
    return this.skuAttributesService.remove(
      productId,
      skuId,
      attributeId,
    );
  }
}
