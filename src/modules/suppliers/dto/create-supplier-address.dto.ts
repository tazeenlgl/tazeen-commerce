import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum SupplierAddressTypeDto {
  OFFICE = 'Office',
  SALE_OFFICE = 'Sale Office',
  HEAD_OFFICE = 'Head Office',
  BILLING_ADDRESS = 'Billing Address',
  SHIPPING_ADDRESS = 'Shipping Address',
  OTHER = 'Other',
}

export class CreateSupplierAddressDto {
  @IsEnum(SupplierAddressTypeDto)
  address_type!: SupplierAddressTypeDto;

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
