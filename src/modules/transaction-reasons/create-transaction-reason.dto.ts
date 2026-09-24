import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const TRANSACTION_REASON_TYPES = [
  'Stock Adjustment',
  'Purchase Return',
  'Sales Return',
  'Exchange',
  'Billing Correction',
  'Wallet Adjustment',
  'Points Adjustment',
  'Voucher Adjustment',
  'Coupon Adjustment',
  'Purchase Cancellation',
  'Transfer Cancellation',
] as const;

export class CreateTransactionReasonDto {
  @IsString()
  @IsIn(TRANSACTION_REASON_TYPES)
  reason_type!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  reason_name!: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
