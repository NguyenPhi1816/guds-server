import { Type } from 'class-transformer';
import { IsInt, IsString, IsUrl } from 'class-validator';

export class UserReviewResponseDto {
  @IsInt()
  id: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsUrl()
  image: string;
}

export class ReviewResponseDto {
  @IsInt()
  id: number;

  @IsString()
  comment: string;

  @IsInt()
  rating: number;

  @Type(() => UserReviewResponseDto)
  customer: UserReviewResponseDto;

  @IsString()
  variant: string;

  @IsString()
  createdAt: string;
}
