import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { UpdateCartType } from 'src/constants/enum';

export class AddToCartRequestDto {
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartQuantityRequestDto {
  @IsEnum(UpdateCartType)
  @IsNotEmpty()
  type: UpdateCartType;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartDetailQuantityParams {
  @Type(() => Number)
  @IsInt()
  productVariantId: number;
}

export class DeleteCartParams {
  @Type(() => Number)
  @IsInt()
  productVariantId: number;
}
