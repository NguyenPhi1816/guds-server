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

export class BaseProductImagesResponseDto {
  @IsInt()
  id: number;

  @IsUrl()
  path: string;

  @IsBoolean()
  isDefault: boolean;
}

export class BaseProductVariantDto {
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

export class BaseProductBrandResponseDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsUrl()
  image: string;
}

export class BaseProductCategoryChildrenResponseDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;
}

export class BaseProductCategoryResponseDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseProductCategoryChildrenResponseDto)
  children: BaseProductCategoryChildrenResponseDto[];
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

  @Type(() => BaseProductCategoryResponseDto)
  category: BaseProductCategoryResponseDto;

  @Type(() => ProductVariantResponseDto)
  brand: BaseProductBrandResponseDto;

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
  @Type(() => BaseProductImagesResponseDto)
  images: BaseProductImagesResponseDto[];

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
  @Type(() => BaseProductVariantDto)
  productVariants: BaseProductVariantDto[];
}

export class BasicBaseProductResponseDto {
  @IsInt()
  id: number;

  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsString()
  brand: string;

  @IsString()
  status: string;

  @IsUrl()
  image: string;
}
