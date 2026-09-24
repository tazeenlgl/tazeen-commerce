import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { SupplierAddressTypeDto } from './create-supplier-address.dto';

export class UpdateSupplierAddressDto {
  @IsOptional()
  @IsEnum(SupplierAddressTypeDto)
  address_type?: SupplierAddressTypeDto;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address_line_1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address_line_2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  pin_code?: string;
}
