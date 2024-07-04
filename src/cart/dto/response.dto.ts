import { IsArray, IsInt, IsString, IsUrl } from 'class-validator';

export class CartResponseDto {
  @IsInt()
  productVariantId: number;

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
