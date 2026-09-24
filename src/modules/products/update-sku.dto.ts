import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateSkuDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  mrp?: number;

  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';
}
