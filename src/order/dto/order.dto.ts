import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateOrderDetailDto {
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  note: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  paymentDate: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  transactionId: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  orderDetails: CreateOrderDetailDto[];
}
