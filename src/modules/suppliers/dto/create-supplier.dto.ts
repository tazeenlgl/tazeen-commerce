import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum SupplierTypeDto {
  Manufacturer = 'Manufacturer',
  Wholesaler = 'Wholesaler',
  Distributor = 'Distributor',
  Brand = 'Brand',
  Other = 'Other',
}

export class CreateSupplierDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  supplier_code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  supplier_name!: string;

  @IsOptional()
  @IsEnum(SupplierTypeDto)
  supplier_type?: SupplierTypeDto;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contact_person?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  mobile!: string;

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
