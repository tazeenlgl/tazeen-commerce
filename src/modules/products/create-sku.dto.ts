import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSkuDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  sku!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  sequence_no!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  mrp!: number;

  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';
}
