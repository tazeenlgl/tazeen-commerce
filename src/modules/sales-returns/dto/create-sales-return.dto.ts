import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateSalesReturnItemDto {
  @IsUUID()
  original_invoice_item_id!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateSalesReturnDto {
  @IsUUID()
  original_invoice_id!: string;

  @IsString()
  @MaxLength(200)
  reason!: string;

  @IsOptional()
  @IsString()
  reason_note?: string;

  @IsIn(['Wallet', 'Cash'])
  settlement_method!: 'Wallet' | 'Cash';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalesReturnItemDto)
  items!: CreateSalesReturnItemDto[];
}
