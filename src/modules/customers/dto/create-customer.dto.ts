import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(20)
  customer_id!: string;

  @IsString()
  @Matches(/^\d{10}$/, { message: 'Phone must be a 10-digit number' })
  phone!: string;

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
}
