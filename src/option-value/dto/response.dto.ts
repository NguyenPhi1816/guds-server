import { IsArray, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class OptionValuesResponseDto {
  @IsString()
  @IsNotEmpty()
  option: string;

  @IsArray()
  @IsString({ each: true })
  values: string[];
}
