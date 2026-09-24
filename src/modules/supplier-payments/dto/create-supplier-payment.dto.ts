import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateSupplierPaymentDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsIn(['Bank_Transfer', 'UPI'])
  payment_method!: 'Bank_Transfer' | 'UPI';

  @IsDateString()
  payment_date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  reference_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // true records the payment as an on-account/advance ledger entry instead
  // of a regular payment; both debit the running balance identically.
  @IsOptional()
  @IsBoolean()
  is_advance?: boolean;
}
