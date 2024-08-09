import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
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

  @IsNumber()
  @IsNotEmpty()
  price: number;
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

  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsString()
  @IsNotEmpty()
  receiverPhoneNumber: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  orderDetails: CreateOrderDetailDto[];
}

export class GetOrdersByUserIdParams {
  @Type(() => Number)
  @IsInt()
  userId: number;
}

export class UpdateOrderParams {
  @Type(() => Number)
  @IsInt()
  orderId: number;

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class IdParam {
  @Type(() => Number)
  @IsInt()
  id: number;
}
