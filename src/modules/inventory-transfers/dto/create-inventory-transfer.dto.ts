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

export class CreateInventoryTransferItemDto {
  @IsUUID()
  sku_id!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateInventoryTransferDto {
  @IsUUID()
  source_location_id!: string;

  @IsUUID()
  destination_location_id!: string;

  @IsString()
  @MaxLength(200)
  reason!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryTransferItemDto)
  items!: CreateInventoryTransferItemDto[];
}
