import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  TRANSACTION_REASON_TYPES,
} from './create-transaction-reason.dto';

export class UpdateTransactionReasonDto {
  @IsOptional()
  @IsString()
  @IsIn(TRANSACTION_REASON_TYPES)
  reason_type?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  reason_name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
