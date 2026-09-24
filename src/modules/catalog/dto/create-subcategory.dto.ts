import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateSubcategoryDto {
  @IsUUID()
  category_id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  subcategory_code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  subcategory_name!: string;

  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';
}
