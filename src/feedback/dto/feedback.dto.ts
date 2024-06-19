import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @IsInt()
  @Min(0)
  rating: number;

  @IsString()
  comment: string;
}

export class UserFeedbackResponseDto {
  @IsInt()
  id: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsUrl()
  image: string;
}

export class FeedbackResponseDto {
  @IsInt()
  id: number;

  @IsString()
  comment: string;

  @IsInt()
  rating: number;

  @Type(() => UserFeedbackResponseDto)
  customer: UserFeedbackResponseDto;

  @IsString()
  variant: string;

  @IsString()
  createdAt: string;
}
