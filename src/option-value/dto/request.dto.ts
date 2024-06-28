import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { optionValueStatus } from 'src/constants/enum/option-value-status.enum';

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

export class AddValuesToOptionRequestDto {
  @IsInt()
  @IsNotEmpty()
  optionId: number;

  @IsArray()
  @IsString({ each: true })
  values: string[];
}

export class UpdateOptionNameRequestDto {
  @IsInt()
  @IsNotEmpty()
  optionId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateOptionStatusRequestDto {
  @IsInt()
  @IsNotEmpty()
  optionId: number;

  @IsEnum(optionValueStatus)
  @IsNotEmpty()
  status: string;
}

export class UpdateValueNameRequestDto {
  @IsInt()
  @IsNotEmpty()
  valueId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateValueStatusRequestDto {
  @IsInt()
  @IsNotEmpty()
  valueId: number;

  @IsEnum(optionValueStatus)
  @IsNotEmpty()
  status: string;
}
