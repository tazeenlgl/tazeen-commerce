import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateAdjustmentDto {
  @IsUUID()
  sku_id!: string;

  @IsUUID()
  location_id!: string;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsUUID()
  reason_id!: string;
}
