import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateReviewRequestDto,
  DeteleReviewParams,
  EditReviewRequestDto,
  ReviewResponseDto,
  UserReviewResponseDto,
} from './dto';
import { OrderStatus } from 'src/constants/enum';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async getReviewsByProductSlug(slug: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        orderDetail: {
          productVariant: {
            baseProduct: {
              slug: slug,
            },
          },
        },
      },
      include: {
        user: true,
        orderDetail: {
          select: {
            productVariant: {
              select: {
                optionValueVariants: {
                  select: {
                    optionValue: {
                      select: {
                        value: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const myReviews: ReviewResponseDto[] = reviews.map((review) => {
      const reviewUser: UserReviewResponseDto = {
        id: review.user.id,
        firstName: review.user.firstName,
        lastName: review.user.lastName,
        image: review.user.image,
      };
      const values = review.orderDetail.productVariant.optionValueVariants.map(
        (optionValueVariant) => optionValueVariant.optionValue.value,
      );
      const response: ReviewResponseDto = {
        id: review.id,
        comment: review.comment,
        createdAt: review.createdAt.toLocaleDateString(),
        customer: reviewUser,
        rating: review.rating,
        variant: values.join(', '),
      };
      return response;
    });

    return myReviews.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async createReview(
    userId: number,
    createReviewRequestDto: CreateReviewRequestDto,
  ) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: createReviewRequestDto.orderId },
        select: {
          status: true,
          orderDetails: {
            include: {
              review: true,
            },
          },
        },
      });

      if (order.status !== OrderStatus.SUCCESS) {
        throw new BadRequestException('Unable to create feedback.');
      }

      if (order.orderDetails[0].review) {
        throw new BadRequestException('Feedback already exists.');
      }

      const response = this.prisma.$transaction(async (prisma) => {
        const query = (orderDetailId: number) =>
          this.prisma.review.create({
            data: {
              rating: createReviewRequestDto.rating,
              comment: createReviewRequestDto.comment,
              createdAt: new Date(),
              orderDetailId: orderDetailId,
              userId: userId,
              updateAt: null,
            },
          });

        const createFeedbackPromises = order.orderDetails.map((detail) =>
          query(detail.id),
        );
        const reviews = await Promise.all(createFeedbackPromises);
        return reviews;
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async editReview(editReviewRequestDto: EditReviewRequestDto) {
    try {
      const review = await this.prisma.review.update({
        where: { id: editReviewRequestDto.reviewId },
        data: {
          comment: editReviewRequestDto.comment,
          rating: editReviewRequestDto.rating,
          updateAt: new Date(),
        },
      });
      return review;
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(deleteReviewParams: DeteleReviewParams) {
    try {
      const response = await this.prisma.review.delete({
        where: { id: deleteReviewParams.reviewId },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}
