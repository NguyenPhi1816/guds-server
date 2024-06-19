import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateFeedbackDto,
  FeedbackResponseDto,
  UserFeedbackResponseDto,
} from './dto';
import { OrderStatus } from 'src/constants/enum';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async getFeedbackByProductSlug(slug: string) {
    const baseProduct = await this.prisma.baseProduct.findUnique({
      where: { Slug: slug },
      select: {
        productVariants: {
          select: {
            feedbacks: { include: { user: true } },
            optionValueVariants: { select: { optionValue: true } },
          },
        },
      },
    });

    const feedbacks: FeedbackResponseDto[] = baseProduct.productVariants.reduce(
      (prev, variant) => {
        const result = variant.feedbacks.map((feedback) => {
          const feedbackUser: UserFeedbackResponseDto = {
            id: feedback.user.Id,
            firstName: feedback.user.FirstName,
            lastName: feedback.user.LastName,
            image: feedback.user.Avatar,
          };

          const optionValue: string[] = variant.optionValueVariants.map(
            (item) => item.optionValue.Value,
          );

          const response: FeedbackResponseDto = {
            id: feedback.Id,
            comment: feedback.Comment,
            createdAt: feedback.CreatedAt.toLocaleString(),
            customer: feedbackUser,
            rating: feedback.Rating,
            variant: optionValue.join(', '),
          };
          return response;
        });
        return [...prev, ...result];
      },
      [],
    );

    return feedbacks.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async createFeedback(userId: number, createFeedbackDto: CreateFeedbackDto) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { Id: createFeedbackDto.orderId },
        select: {
          Status: true,
          orderDetails: {
            include: {
              feedback: true,
            },
          },
        },
      });

      if (order.Status !== OrderStatus.SUCCESS) {
        throw new BadRequestException('Unable to create feedback.');
      }

      if (order.orderDetails[0].feedback) {
        throw new BadRequestException('Feedback already exists.');
      }

      const query = (orderDetailId: number, productVariantId: number) =>
        this.prisma.feedback.create({
          data: {
            Rating: createFeedbackDto.rating,
            Comment: createFeedbackDto.comment,
            CreatedAt: new Date(),
            OrderDetailId: orderDetailId,
            ProductVariantId: productVariantId,
            UserId: userId,
          },
        });

      const createFeedbackPromises = order.orderDetails.map((detail) =>
        query(detail.Id, detail.ProductVariantId),
      );

      const feedbacks = await Promise.all(createFeedbackPromises);

      return feedbacks;
    } catch (error) {
      throw error;
    }
  }
}
