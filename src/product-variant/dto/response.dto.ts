import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class OptionValueResponseDto {
  @IsString()
  option: String;

  @IsString()
  value: String;
}

export class ProductVariantResponseDto {
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
