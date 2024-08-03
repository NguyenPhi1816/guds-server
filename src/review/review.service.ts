import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateReviewRequestDto,
  DeteleReviewParams,
  EditReviewRequestDto,
  ReviewDto,
  ReviewResponseDto,
  UserReviewResponseDto,
} from './dto';
import { OrderStatus } from 'src/constants/enum';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async getReviewsByProductSlug(
    slug: string,
    rating?: number,
    page: number = 1,
    limit: number = 5,
  ) {
    const reviewFilter: any = {
      orderDetail: {
        productVariant: {
          baseProduct: {
            slug: slug,
          },
        },
      },
    };

    if (!Number.isNaN(rating)) {
      reviewFilter.rating = rating;
    }

    // Count the total number of reviews matching the filter
    const numberOfReviews = await this.prisma.review.count({
      where: reviewFilter,
    });

    const reviews = await this.prisma.review.findMany({
      where: reviewFilter,
      include: {
        orderDetail: {
          select: {
            order: {
              select: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                  },
                },
              },
            },
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
      skip: (page - 1) * limit,
      take: limit,
    });

    const myReviews: ReviewDto[] = reviews.map((review) => {
      const user = review.orderDetail.order.user;
      const reviewUser: UserReviewResponseDto = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
      };
      const values = review.orderDetail.productVariant.optionValueVariants.map(
        (optionValueVariant) => optionValueVariant.optionValue.value,
      );
      const result: ReviewDto = {
        id: review.id,
        comment: review.comment,
        createdAt: review.createdAt.toLocaleDateString(),
        customer: reviewUser,
        rating: review.rating,
        variant: values.join(', '),
      };
      return result;
    });

    const response: ReviewResponseDto = {
      numberOfReviews: numberOfReviews,
      reviews: myReviews.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    };

    return response;
  }

  async createReview(createReviewRequestDto: CreateReviewRequestDto) {
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
