import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { customer_status } from '@prisma/client';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Phone must be a 10-digit number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(customer_status)
  status?: customer_status;
}
