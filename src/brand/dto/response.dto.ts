import { IsString, IsUrl } from 'class-validator';

export class BasicBrandResponseDto {
  @IsString()
  slug: string;
  @IsString()
  name: string;
  @IsUrl()
  image: string;
}
