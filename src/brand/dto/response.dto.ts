import { IsInt, IsString, IsUrl } from 'class-validator';

export class BasicBrandResponseDto {
  @IsInt()
  id: number;
  @IsString()
  slug: string;
  @IsString()
  name: string;
  @IsUrl()
  image: string;
  @IsInt()
  numberOfProducts: number;
}

export class BrandProductResponse {
  id: number;
  slug: string;
  name: string;
  category: {
    id: number;
    slug: string;
    name: string;
  }[];
  brand: {
    id: number;
    slug: string;
    name: string;
  };
  status: string;
}
