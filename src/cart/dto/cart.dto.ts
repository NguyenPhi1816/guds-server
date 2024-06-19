import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class AddToCartDto {
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CartResponseDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsInt()
  price: number;

  @IsUrl()
  image: string;

  @IsArray()
  @IsString({ each: true })
  optionValues: string[];

  @IsInt()
  quantity: number;
}
