import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsUrl,
  Min,
} from 'class-validator';
import { UpdateQuantityType } from 'src/constants/enum/update-quantiy-type.enum';

export class CreateProductVariantRequestDto {
  @IsInt()
  @IsNotEmpty()
  baseProductId: number;

  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsInt({ each: true })
  optionValueIds: number[];
}

export class UpdateVariantRequestDto {
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsUrl()
  image: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  quantity: number;
}
