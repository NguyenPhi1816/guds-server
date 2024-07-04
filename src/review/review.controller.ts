import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import {
  CreateReviewRequestDto,
  EditReviewRequestDto,
  DeteleReviewParams,
  GetFeedbackByBaseProductSlugParams,
} from './dto';

@Controller('api/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('/:slug')
  getFeedbackByBaseProductSlug(
    @Param() params: GetFeedbackByBaseProductSlugParams,
  ) {
    return this.reviewService.getReviewsByProductSlug(params.slug);
  }

  @Post()
  @UseGuards(JwtGuard)
  createFeedback(
    @GetUser('id') userId: number,
    @Body() createReviewRequestDto: CreateReviewRequestDto,
  ) {
    return this.reviewService.createReview(userId, createReviewRequestDto);
  }

  @Put()
  @UseGuards(JwtGuard)
  editFeedback(@Body() editReviewRequestDto: EditReviewRequestDto) {
    return this.reviewService.editReview(editReviewRequestDto);
  }

  @Delete('/:reviewId')
  @UseGuards(JwtGuard)
  deleteFeedback(@Param() deleteReviewParams: DeteleReviewParams) {
    return this.reviewService.deleteReview(deleteReviewParams);
  }
}
