// import { IsInt, IsString, IsUrl, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class ProductVariantResponseDto {
  @IsInt()
  id: number;

  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsInt()
  variantId: number;

  @IsUrl()
  image: string;

  @IsInt()
  price: number;
}

export class CategoryResponseDto {
  @IsInt()
  id: number;

  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsUrl()
  image: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantResponseDto)
  products: ProductVariantResponseDto[];
}
