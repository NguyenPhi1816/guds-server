import { ConflictException, Injectable } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/constants/enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto';
import {
  CreateOrderResponseDto,
  OrderDetailDto,
  OrderDetailResponse,
  OrderDto,
  OrderPaymentDto,
  OrderResponse,
  PaymentResponse,
  ReviewResponse,
} from './dto/response';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getAllOrders() {
    try {
      const orders = this.prisma.order.findMany();
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async getOrdersByUserId(userId: number): Promise<OrderResponse[]> {
    try {
      const orders = await this.prisma.order.findMany({
        where: { userId: userId },
        select: {
          id: true,
        },
      });

      const promises = orders.map((order) => this.getOrderDetailById(order.id));
      const response = await Promise.all(promises);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async createOrder(
    userId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    try {
      const productVariantQueries = createOrderDto.orderDetails.map(
        (orderDetail) =>
          this.prisma.productVariant.findUnique({
            where: { id: orderDetail.productVariantId },
          }),
      );

      const productVariants = await Promise.all(productVariantQueries);

      const isValid = createOrderDto.orderDetails.reduce(
        (prev, orderDetail, index) => {
          return (
            prev && productVariants[index].quantity >= orderDetail.quantity
          );
        },
        true,
      );

      if (!isValid) {
        throw new ConflictException('Số lượng sản phẩm không đủ');
      }

      const result = await this.prisma.$transaction(async (prisma) => {
        // save order
        const order = await prisma.order.create({
          data: {
            userId: userId,
            status: OrderStatus.PENDING,
            createAt: new Date(),
            note: createOrderDto.note,
            receiverName: createOrderDto.receiverName,
            receiverAddress: createOrderDto.receiverAddress,
            receiverPhoneNumber: createOrderDto.receiverPhoneNumber,
          },
        });

        // create order details
        const orderDetailPromises = createOrderDto.orderDetails.map(
          (orderDetail) =>
            prisma.orderDetail.create({
              data: {
                orderId: order.id,
                productVariantId: orderDetail.productVariantId,
                quantity: orderDetail.quantity,
              },
              include: {
                productVariant: {
                  select: {
                    price: true,
                  },
                },
              },
            }),
        );
        const orderDetails = await Promise.all(orderDetailPromises);

        // update quantity
        const quantityUpdatePromises = orderDetails.map((detail) =>
          prisma.productVariant.update({
            where: { id: detail.productVariantId },
            data: { quantity: { decrement: detail.quantity } },
          }),
        );
        await Promise.all(quantityUpdatePromises);

        // create payment
        const totalPrice = orderDetails.reduce(
          (prev, detail) =>
            prev + detail.productVariant.price * detail.quantity,
          0,
        );
        const payment = await prisma.payment.create({
          data: {
            totalPrice: totalPrice,
            paymentMethod: createOrderDto.paymentMethod,
            status: PaymentStatus.PENDING,
            orderId: order.id,
            paymentDate: null,
            transactionId: null,
          },
        });

        return { order, orderDetails, payment };
      });

      const order: OrderDto = {
        id: result.order.id,
        userId: result.order.userId,
        receiverName: result.order.receiverName,
        receiverPhoneNumber: result.order.receiverPhoneNumber,
        receiverAddress: result.order.receiverAddress,
        note: result.order.note,
        createAt: result.order.createAt.toISOString(),
        status: result.order.status as OrderStatus,
      };

      const orderDetails: OrderDetailDto[] = result.orderDetails.map(
        (item) => ({
          id: item.id,
          price: item.productVariant.price,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        }),
      );

      const payment: OrderPaymentDto = {
        id: result.payment.id,
        paymentMethod: result.payment.paymentMethod as PaymentMethod,
        paymentDate: null,
        totalPrice: result.payment.totalPrice,
        status: result.payment.status as PaymentStatus,
        transactionId: null,
      };

      const response: CreateOrderResponseDto = {
        order,
        orderDetails,
        payment,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(orderId: number, status: string) {
    try {
      const _order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (
        _order.status !== OrderStatus.PENDING &&
        _order.status !== OrderStatus.SHIPPING
      ) {
        throw new ConflictException('Unable to update order.');
      }
      const result = await this.prisma.$transaction(async (prisma) => {
        switch (status) {
          case OrderStatus.SHIPPING: {
            const order = await this.prisma.order.update({
              where: {
                id: orderId,
              },
              data: {
                status: OrderStatus.SHIPPING,
              },
              select: {
                id: true,
                receiverName: true,
                receiverPhoneNumber: true,
                receiverAddress: true,
                note: true,
                createAt: true,
                status: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                orderDetails: {
                  select: {
                    id: true,
                    quantity: true,
                    review: {
                      select: {
                        id: true,
                        comment: true,
                        rating: true,
                        createdAt: true,
                        updateAt: true,
                      },
                    },
                    productVariant: {
                      select: {
                        image: true,
                        baseProduct: {
                          select: {
                            name: true,
                          },
                        },
                        optionValueVariants: {
                          select: {
                            optionValue: {
                              select: {
                                value: true,
                              },
                            },
                          },
                        },
                        price: true,
                      },
                    },
                  },
                },
                payment: {
                  select: {
                    paymentMethod: true,
                    paymentDate: true,
                    totalPrice: true,
                    status: true,
                    transactionId: true,
                  },
                },
              },
            });
            return order;
          }
          case OrderStatus.SUCCESS: {
            const order = await prisma.order.update({
              where: { id: orderId },
              data: { status: OrderStatus.SUCCESS },
              select: {
                id: true,
                receiverName: true,
                receiverPhoneNumber: true,
                receiverAddress: true,
                note: true,
                createAt: true,
                status: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                orderDetails: {
                  select: {
                    id: true,
                    productVariantId: true,
                    quantity: true,
                    review: {
                      select: {
                        id: true,
                        comment: true,
                        rating: true,
                        createdAt: true,
                        updateAt: true,
                      },
                    },
                    productVariant: {
                      select: {
                        image: true,
                        baseProduct: {
                          select: {
                            name: true,
                          },
                        },
                        optionValueVariants: {
                          select: {
                            optionValue: {
                              select: {
                                value: true,
                              },
                            },
                          },
                        },
                        price: true,
                      },
                    },
                  },
                },
                payment: {
                  select: {
                    id: true,
                    paymentMethod: true,
                    paymentDate: true,
                    totalPrice: true,
                    status: true,
                    transactionId: true,
                  },
                },
              },
            });
            if (order.payment.paymentMethod === PaymentMethod.CASH) {
              const payment = await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                  status: PaymentStatus.SUCCESS,
                  paymentDate: new Date(),
                  transactionId: null,
                },
                select: {
                  paymentMethod: true,
                  paymentDate: true,
                  totalPrice: true,
                  status: true,
                  transactionId: true,
                },
              });
              delete order.payment;
              return { ...order, payment };
            }
            return order;
          }
          case OrderStatus.CANCEL: {
            // update order status to CANCEL
            const order = await prisma.order.update({
              where: { id: orderId },
              data: { status: OrderStatus.CANCEL },
              select: {
                id: true,
                receiverName: true,
                receiverPhoneNumber: true,
                receiverAddress: true,
                note: true,
                createAt: true,
                status: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                orderDetails: {
                  select: {
                    id: true,
                    productVariantId: true,
                    quantity: true,
                    review: {
                      select: {
                        id: true,
                        comment: true,
                        rating: true,
                        createdAt: true,
                        updateAt: true,
                      },
                    },
                    productVariant: {
                      select: {
                        image: true,
                        baseProduct: {
                          select: {
                            name: true,
                          },
                        },
                        optionValueVariants: {
                          select: {
                            optionValue: {
                              select: {
                                value: true,
                              },
                            },
                          },
                        },
                        price: true,
                      },
                    },
                  },
                },
                payment: {
                  select: {
                    id: true,
                    paymentMethod: true,
                  },
                },
              },
            });

            // update quantity
            const updateQuantityPromises = order.orderDetails.map((detail) =>
              prisma.productVariant.update({
                where: { id: detail.productVariantId },
                data: { quantity: { increment: detail.quantity } },
              }),
            );
            await Promise.all(updateQuantityPromises);

            // update payment status to CANCEL (check by cash) or REFUND (check by another method)
            if (order.payment.paymentMethod === PaymentMethod.CASH) {
              const payment = await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                  status: PaymentStatus.CANCEL,
                  paymentDate: null,
                  transactionId: null,
                },
              });
              delete order.payment;
              return { ...order, payment };
            } else {
              const payment = await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                  status: PaymentStatus.REFUND,
                  paymentDate: new Date(),
                  transactionId: 'refunded-transaction-id',
                },
                select: {
                  paymentMethod: true,
                  paymentDate: true,
                  totalPrice: true,
                  status: true,
                  transactionId: true,
                },
              });
              delete order.payment;
              return { ...order, payment };
            }
          }
          default: {
            throw new ConflictException(
              'Có lỗi xảy ra trong quá trình cập nhật trạng thái đơn hàng',
            );
          }
        }
      });

      const orderDetails: OrderDetailResponse[] = result.orderDetails.map(
        (orderDetail) => {
          const review: ReviewResponse = orderDetail.review
            ? {
                id: orderDetail.review.id,
                comment: orderDetail.review.comment,
                rating: orderDetail.review.rating,
                createdAt: orderDetail.review.createdAt.toISOString(),
                updateAt: orderDetail.review.updateAt
                  ? orderDetail.review.updateAt.toISOString()
                  : null,
              }
            : null;

          return {
            id: orderDetail.id,
            productName: orderDetail.productVariant.baseProduct.name,
            productImage: orderDetail.productVariant.image,
            optionValue: orderDetail.productVariant.optionValueVariants.map(
              (optionValueVariant) => optionValueVariant.optionValue.value,
            ),
            quantity: orderDetail.quantity,
            price: orderDetail.productVariant.price,
            review: review,
          };
        },
      );

      const payment: PaymentResponse = {
        ...result.payment,
        paymentDate: result.payment.paymentDate
          ? result.payment.paymentDate.toISOString()
          : null,
      };

      const response: OrderResponse = {
        id: result.id,
        userId: result.user.id,
        userName: result.user.firstName + ' ' + result.user.lastName,
        receiverName: result.receiverName,
        receiverPhoneNumber: result.receiverPhoneNumber,
        receiverAddress: result.receiverAddress,
        note: result.note,
        createAt: result.createAt.toISOString(),
        status: result.status,
        orderDetails: orderDetails,
        payment: payment,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getOrderDetailById(orderId: number): Promise<OrderResponse> {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          id: true,
          receiverName: true,
          receiverPhoneNumber: true,
          receiverAddress: true,
          note: true,
          createAt: true,
          status: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          orderDetails: {
            select: {
              id: true,
              quantity: true,
              review: {
                select: {
                  id: true,
                  comment: true,
                  rating: true,
                  createdAt: true,
                  updateAt: true,
                },
              },
              productVariant: {
                select: {
                  image: true,
                  baseProduct: {
                    select: {
                      name: true,
                    },
                  },
                  optionValueVariants: {
                    select: {
                      optionValue: {
                        select: {
                          value: true,
                        },
                      },
                    },
                  },
                  price: true,
                },
              },
            },
          },
          payment: {
            select: {
              paymentMethod: true,
              paymentDate: true,
              totalPrice: true,
              status: true,
              transactionId: true,
            },
          },
        },
      });

      const orderDetails: OrderDetailResponse[] = order.orderDetails.map(
        (orderDetail) => {
          const review: ReviewResponse = orderDetail.review
            ? {
                id: orderDetail.review.id,
                comment: orderDetail.review.comment,
                rating: orderDetail.review.rating,
                createdAt: orderDetail.review.createdAt.toISOString(),
                updateAt: orderDetail.review.updateAt
                  ? orderDetail.review.updateAt.toISOString()
                  : null,
              }
            : null;
          return {
            id: orderDetail.id,
            productName: orderDetail.productVariant.baseProduct.name,
            productImage: orderDetail.productVariant.image,
            optionValue: orderDetail.productVariant.optionValueVariants.map(
              (optionValueVariant) => optionValueVariant.optionValue.value,
            ),
            quantity: orderDetail.quantity,
            price: orderDetail.productVariant.price,
            review: review,
          };
        },
      );

      const payment: PaymentResponse = {
        ...order.payment,
        paymentDate: order.payment.paymentDate
          ? order.payment.paymentDate.toISOString()
          : null,
      };

      const response: OrderResponse = {
        id: order.id,
        userId: order.user.id,
        userName: order.user.firstName + ' ' + order.user.lastName,
        receiverName: order.receiverName,
        receiverPhoneNumber: order.receiverPhoneNumber,
        receiverAddress: order.receiverAddress,
        note: order.note,
        createAt: order.createAt.toISOString(),
        status: order.status,
        orderDetails: orderDetails,
        payment: payment,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateVNpayPayment(orderId: number, transactionId: string) {
    try {
      await this.prisma.payment.update({
        where: { orderId: orderId },
        data: {
          paymentDate: new Date(),
          transactionId: transactionId,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
