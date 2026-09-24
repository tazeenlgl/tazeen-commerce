import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSupplierBankAccountDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bank_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(34)
  account_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ifsc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  branch?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  account_holder_name?: string;
}
