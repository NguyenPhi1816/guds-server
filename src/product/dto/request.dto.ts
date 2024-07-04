import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateProductOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  values: string[];
}

export class CreateProductOptionValueDto {
  @IsString()
  @IsNotEmpty()
  option: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateProductVariantDto {
  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsUrl()
  image: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionValueDto)
  optionValues: CreateProductOptionValueDto[];
}

export class CreateBaseProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  categoryIds: number[];

  @IsInt()
  @IsNotEmpty()
  brandId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images: string[];
}

export class GetBaseProductBySlugParams {
  @IsString()
  @IsNotEmpty()
  slug: string;
}

export class GetProductsByCategorySlugParams {
  @IsString()
  @IsNotEmpty()
  slug: string;
}
