import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category_code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  category_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';
}
