import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateSubcategoryDto {
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  subcategory_code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  subcategory_name?: string;

  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';
}
