import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSkuAttributeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  attribute_name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  attribute_value!: string;
}
