import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddToCartRequestDto,
  CartResponseDto,
  UpdateCartQuantityRequestDto,
} from './dto';
import { UpdateCartType } from 'src/constants/enum';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCartByUserId(userId: number) {
    try {
      const carts = await this.prisma.cart.findMany({
        where: { userId: userId },
        select: {
          productVariant: {
            select: {
              id: true,
              baseProduct: {
                select: {
                  name: true,
                },
              },
              prices: {
                orderBy: {
                  updatedAt: 'desc',
                },
                take: 1,
                select: {
                  price: true,
                },
              },
              image: true,
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
          quantity: true,
        },
      });

      const response: CartResponseDto[] = carts.map((cart) => ({
        productVariantId: cart.productVariant.id,
        name: cart.productVariant.baseProduct.name,
        image: cart.productVariant.image,
        price: cart.productVariant.prices[0].price,
        optionValues: cart.productVariant.optionValueVariants.map(
          (item) => item.optionValue.value,
        ),
        quantity: cart.quantity,
      }));
      return response;
    } catch (error) {
      throw error;
    }
  }

  async addProductToCart(userId: number, addToCartDto: AddToCartRequestDto) {
    try {
      const existedCart = await this.prisma.cart.findUnique({
        where: {
          cartId: {
            userId: userId,
            productVariantId: addToCartDto.productVariantId,
          },
        },
      });

      const productVariant = await this.prisma.productVariant.findUnique({
        where: {
          id: addToCartDto.productVariantId,
        },
        select: {
          quantity: true,
        },
      });

      if (existedCart) {
        // check if inventory quantity is greater than existed cart quantity + request quantity
        if (
          productVariant.quantity >=
          existedCart.quantity + addToCartDto.quantity
        ) {
          const cart = await this.prisma.cart.update({
            where: {
              cartId: {
                userId: existedCart.userId,
                productVariantId: existedCart.productVariantId,
              },
            },
            data: {
              quantity: {
                increment: addToCartDto.quantity,
              },
            },
          });
          return cart;
        } else {
          throw new ConflictException('Số lượng hàng tồn kho không đủ');
        }
      }

      // check if inventory quantity is greater than request quantity
      if (productVariant.quantity >= addToCartDto.quantity) {
        const newCart = await this.prisma.cart.create({
          data: {
            userId: userId,
            productVariantId: addToCartDto.productVariantId,
            quantity: addToCartDto.quantity,
            create_at: new Date(),
          },
        });
        return newCart;
      } else {
        throw new ConflictException('Số lượng hàng tồn kho không đủ');
      }
    } catch (error) {
      throw error;
    }
  }

  async updateCartQuantity(
    userId: number,
    productVariantId: number,
    updateCartQuantityRequestDto: UpdateCartQuantityRequestDto,
  ) {
    try {
      const myCart = await this.prisma.cart.findUnique({
        where: {
          cartId: {
            userId: userId,
            productVariantId: productVariantId,
          },
        },
        select: { quantity: true },
      });

      if (!myCart) {
        throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
      }

      if (updateCartQuantityRequestDto.type === UpdateCartType.increment) {
        // check if inventory quantity is greater than request quantity
        const productVariant = await this.prisma.productVariant.findUnique({
          where: {
            id: productVariantId,
          },
        });

        if (
          productVariant.quantity <
          myCart.quantity + updateCartQuantityRequestDto.quantity
        ) {
          throw new ConflictException('Số lượng tồn kho không đủ');
        }
      } else if (
        updateCartQuantityRequestDto.type === UpdateCartType.decrement
      ) {
        const diff = myCart.quantity - updateCartQuantityRequestDto.quantity;
        if (diff === 0) {
          // if request quantity is equal to cart quantity => delete cart
          return this.deleteCart(userId, productVariantId);
        } else if (diff < 0) {
          // if request quantity is greater than cart quantity => not valid request quantity => throw exception
          throw new ConflictException('Số lượng giảm không hợp lệ');
        }
      }

      const cart = await this.prisma.cart.update({
        where: {
          cartId: {
            userId: userId,
            productVariantId: productVariantId,
          },
        },
        data: {
          quantity:
            updateCartQuantityRequestDto.type === UpdateCartType.increment
              ? { increment: updateCartQuantityRequestDto.quantity }
              : { decrement: updateCartQuantityRequestDto.quantity },
        },
      });
      return cart;
    } catch (error) {
      throw error;
    }
  }

  async deleteCart(userId: number, productVariantId: number) {
    try {
      const res = await this.prisma.cart.delete({
        where: {
          cartId: { userId: userId, productVariantId: productVariantId },
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }
}
