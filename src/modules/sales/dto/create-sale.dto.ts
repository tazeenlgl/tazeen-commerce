import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateSaleItemDto {
  @IsUUID()
  sku_id!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsIn(['percent', 'flat'])
  discount_type?: 'percent' | 'flat';

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_value?: number;
}

export class CreateSalePaymentDto {
  @IsIn([
    'Cash',
    'UPI',
    'Wallet',
    'Points',
    'Gift_Voucher',
    'Coupon',
    'Credit_Card',
    'Debit_Card',
  ])
  payment_method!:
    | 'Cash'
    | 'UPI'
    | 'Wallet'
    | 'Points'
    | 'Gift_Voucher'
    | 'Coupon'
    | 'Credit_Card'
    | 'Debit_Card';

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  payment_reference?: string;
}

export class CreateSaleDto {
  @IsUUID()
  location_id!: string;

  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bill_discount?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalePaymentDto)
  payments!: CreateSalePaymentDto[];
}
