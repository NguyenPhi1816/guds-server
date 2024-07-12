// import { IsInt, IsString, IsUrl, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class CategoryResponse {
  id: number;
  slug: string;
  name: string;
  image: string;
  description: string;
}

export class CategoryParentCategory {
  id: number;
  slug: string;
  name: string;
}

export class AllCategoryResponse {
  id: number;
  slug: string;
  name: string;
  image: string;
  description: string;
  parent: CategoryParentCategory | null;
  numberOfBaseProduct: number;
  numberOfChildren: number;
}

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
