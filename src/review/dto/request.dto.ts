import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateReviewRequestDto {
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  comment: string;
}

export class EditReviewRequestDto {
  @IsInt()
  @IsNotEmpty()
  reviewId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  comment: string;
}

export class DeteleReviewParams {
  @Type(() => Number)
  @IsInt()
  reviewId: number;
}

export class GetFeedbackByBaseProductSlugParams {
  @IsString()
  @IsNotEmpty()
  slug: string;
}
