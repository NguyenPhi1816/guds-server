import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class AddProductOptionDto {
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
