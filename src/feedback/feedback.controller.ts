import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { CreateFeedbackDto } from './dto';
import { FeedbackService } from './feedback.service';

@Controller('api/feedbacks')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  // @Get('/:slug')
  // getFeedbackByBaseProductSlug(@Param('slug') slug: string) {
  //   return this.feedbackService.getFeedbackByProductSlug(slug);
  // }

  // @Post()
  // @UseGuards(JwtGuard)
  // createFeedback(
  //   @GetUser('Id') userId: number,
  //   @Body() createFeedbackDto: CreateFeedbackDto,
  // ) {
  //   return this.feedbackService.createFeedback(userId, createFeedbackDto);
  // }
}
