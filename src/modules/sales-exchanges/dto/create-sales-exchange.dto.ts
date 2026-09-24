import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ExchangeOriginalItemDto {
  @IsUUID()
  original_invoice_item_id!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class ExchangeReplacementItemDto {
  @IsUUID()
  sku_id!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsIn(['percent', 'flat'])
  discount_type?: 'percent' | 'flat';

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_value?: number;
}

export class CreateSalesExchangeDto {
  @IsUUID()
  original_invoice_id!: string;

  @IsString()
  @MaxLength(200)
  reason!: string;

  @IsOptional()
  @IsString()
  reason_note?: string;

  // Required only when the exchange has a non-zero settlement difference;
  // enforced in the service since it depends on computed pricing.
  @IsOptional()
  @IsIn(['Wallet', 'Cash'])
  settlement_method?: 'Wallet' | 'Cash';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExchangeOriginalItemDto)
  original_items!: ExchangeOriginalItemDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExchangeReplacementItemDto)
  replacement_items!: ExchangeReplacementItemDto[];
}
