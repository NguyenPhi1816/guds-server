import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ValueResponseDto {
  @IsInt()
  @IsNotEmpty()
  valueId: number;

  @IsString()
  @IsNotEmpty()
  valueName: string;
}

export class OptionValuesResponseDto {
  @IsInt()
  @IsNotEmpty()
  optionId: number;

  @IsString()
  @IsNotEmpty()
  optionName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValueResponseDto)
  values: ValueResponseDto[];
}
