import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSupplierDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  supplier_name?: string;

  @IsOptional()
  @IsEnum(['Manufacturer', 'Wholesaler', 'Distributor', 'Brand', 'Other'])
  supplier_type?: 'Manufacturer' | 'Wholesaler' | 'Distributor' | 'Brand' | 'Other';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contact_person?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  mobile?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  alternate_mobile?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gstin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  pan?: string;

  @IsOptional()
  @IsEnum(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';

  @IsOptional()
  @IsString()
  internal_notes?: string;
}
