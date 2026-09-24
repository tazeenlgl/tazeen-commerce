import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  product_id?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  core_sku?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  product_name?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsUUID()
  subcategory_id?: string;

  @IsOptional()
  @IsUUID()
  supplier_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  hsn?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 5, 12])
  gst_rate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchase_rate?: number;

  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';
}
