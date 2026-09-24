import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreatePurchaseReturnItemDto {
  @IsUUID()
  original_invoice_item_id!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreatePurchaseReturnDto {
  @IsUUID()
  purchase_invoice_id!: string;

  @IsString()
  @MaxLength(200)
  reason!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseReturnItemDto)
  items!: CreatePurchaseReturnItemDto[];
}
