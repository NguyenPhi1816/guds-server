import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class OptionValuesDto {
  @IsString()
  @IsNotEmpty()
  option: string;

  @IsArray()
  @IsString({ each: true })
  values: string[];
}

export class CreateOptionValuesRequestDto {
  @IsInt()
  @IsNotEmpty()
  baseProductId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionValuesDto)
  optionValues: OptionValuesDto[];
}
