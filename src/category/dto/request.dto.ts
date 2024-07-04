import {
  Allow,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export class AddCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @ValidateIf((object, value) => value !== null)
  parentId: number | null;
}

export class UpdateCategoryDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @ValidateIf((object, value) => value !== null)
  parentId: number | null;
}

export class GetCategoryBySlugParams {
  @IsString()
  @IsNotEmpty()
  slug: string;
}
