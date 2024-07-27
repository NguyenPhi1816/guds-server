import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
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

  @IsOptional()
  @IsString()
  comment: string | null;
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

  @IsOptional()
  @IsString()
  comment: string | null;
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
