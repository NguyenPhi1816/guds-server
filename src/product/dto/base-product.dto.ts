import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductVariantResponseDto } from 'src/category/dto/response.dto';

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

export class CreateProductOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  values: string[];
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  categoryId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images: string[];

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  options: CreateProductOptionDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}

export class OptionValuesResponseDto {
  @IsString()
  option: String;

  @IsArray()
  @IsString({ each: true })
  values: String[];
}

export class OptionValueResponseDto {
  @IsString()
  option: String;

  @IsString()
  value: String;
}

export class ImageResponseDto {
  @IsInt()
  Id: number;

  @IsUrl()
  Path: string;

  @IsBoolean()
  IsDefault: boolean;
}

export class ProductVariantDto {
  @IsInt()
  id: number;

  @IsUrl()
  image: string;

  @IsInt()
  quantity: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionValueResponseDto)
  optionValue: OptionValueResponseDto[];

  @IsInt()
  price: number;
}

export class BaseProductResponseDto {
  @IsInt()
  id: number;

  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  categoryId: number;

  @IsString()
  status: String;

  @IsInt()
  averageRating: number;

  @IsInt()
  numberOfFeedbacks: number;

  @IsInt()
  numberOfPurchases: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageResponseDto)
  images: ImageResponseDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionValuesResponseDto)
  optionValues: OptionValuesResponseDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantResponseDto)
  relatedProducts: ProductVariantResponseDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  productVariants: ProductVariantDto[];
}
