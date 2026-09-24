import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PurchaseTaxModeDto {
  INTRA_STATE = 'INTRA_STATE',
  INTER_STATE = 'INTER_STATE',
}

export class CreatePurchaseInvoiceItemDto {
  @IsString()
  @MaxLength(50)
  sku_id!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @MaxLength(30)
  purchase_rate!: string;

  @IsString()
  @MaxLength(10)
  gst_rate!: string;
}

export class CreatePurchaseInvoiceDto {
  @IsString()
  @MaxLength(100)
  supplier_id!: string;

  @IsString()
  @MaxLength(100)
  invoice_no!: string;

  @IsDateString()
  purchase_date!: string;

  @IsString()
  @MaxLength(100)
  location_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  document_name?: string;

  @IsEnum(PurchaseTaxModeDto)
  tax_mode!: PurchaseTaxModeDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInvoiceItemDto)
  items!: CreatePurchaseInvoiceItemDto[];
}
