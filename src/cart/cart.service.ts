import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto, CartResponseDto } from './dto';
import { UpdateCartType } from 'src/constants/enum';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCartByUserId(userId: number) {
    try {
      const cart = await this.prisma.cart.findUnique({
        where: { UserId: userId },
        select: {
          cartDetails: {
            select: {
              Id: true,
              productVariant: {
                select: {
                  Id: true,
                  baseProduct: {
                    select: {
                      Name: true,
                    },
                  },
                  prices: {
                    orderBy: {
                      UpdatedAt: 'desc',
                    },
                    take: 1,
                    select: {
                      Price: true,
                    },
                  },
                  Image: true,
                  optionValueVariants: {
                    select: {
                      optionValue: {
                        select: {
                          Value: true,
                        },
                      },
                    },
                  },
                },
              },
              Quantity: true,
            },
          },
        },
      });

      const response: CartResponseDto[] = cart.cartDetails.map((detail) => ({
        id: detail.Id,
        name: detail.productVariant.baseProduct.Name,
        image: detail.productVariant.Image,
        price: detail.productVariant.prices[0].Price,
        optionValues: detail.productVariant.optionValueVariants.map(
          (item) => item.optionValue.Value,
        ),
        quantity: detail.Quantity,
      }));
      return response;
    } catch (error) {
      throw error;
    }
  }

  async addProductToCart(userId: number, addToCartDto: AddToCartDto) {
    try {
      const cart = await this.prisma.cart.findUnique({
        where: { Id: userId },
        select: {
          Id: true,
          cartDetails: true,
        },
      });

      const existedCartDetail = cart.cartDetails.find(
        (detail) => detail.ProductVariantId === addToCartDto.productVariantId,
      );

      if (existedCartDetail) {
        const cartDetail = await this.prisma.cartDetail.update({
          where: { Id: existedCartDetail.Id },
          data: {
            Quantity: {
              increment: addToCartDto.quantity,
            },
          },
        });
        return cartDetail;
      }

      const newCartDetail = await this.prisma.cartDetail.create({
        data: {
          CartId: cart.Id,
          ProductVariantId: addToCartDto.productVariantId,
          Quantity: addToCartDto.quantity,
        },
      });
      return newCartDetail;
    } catch (error) {
      throw error;
    }
  }

  async updateCartDetailQuantity(_cartDetailId: string, type: string) {
    try {
      const cartDetailId = Number.parseInt(_cartDetailId);

      switch (type) {
        case UpdateCartType.decrement: {
          const cartDetail = await this.prisma.cartDetail.update({
            where: { Id: cartDetailId },
            data: {
              Quantity: {
                decrement: 1,
              },
            },
          });
          return cartDetail;
        }
        case UpdateCartType.increment: {
          const cartDetail = await this.prisma.cartDetail.update({
            where: { Id: cartDetailId },
            data: {
              Quantity: {
                increment: 1,
              },
            },
          });
          return cartDetail;
        }
        default:
          throw new BadRequestException('Unable to update cart detail');
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteCartDetail(_cartDetailId: string) {
    try {
      const cartDetailId = Number.parseFloat(_cartDetailId);
      const res = await this.prisma.cartDetail.delete({
        where: { Id: cartDetailId },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }
}
