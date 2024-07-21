import { ConflictException, Injectable } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/constants/enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto';
import {
  OrderDetailResponse,
  OrderResponse,
  PaymentResponse,
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

  async getOrdersByUserId(userId: number) {
    try {
      const orders = this.prisma.order.findMany({ where: { userId: userId } });
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
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

      const response = await this.prisma.$transaction(async (prisma) => {
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
            status:
              createOrderDto.paymentMethod === PaymentMethod.CASH
                ? PaymentStatus.PENDING
                : PaymentStatus.SUCCESS,
            orderId: order.id,
            paymentDate: createOrderDto.paymentDate
              ? new Date(createOrderDto.paymentDate)
              : null,
            transactionId: createOrderDto.transactionId,
          },
        });

        return { order, orderDetails, payment };
      });

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

      if (_order.status !== OrderStatus.PENDING) {
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

      console.log(result);

      const orderDetails: OrderDetailResponse[] = result.orderDetails.map(
        (orderDetail) => {
          return {
            id: orderDetail.id,
            productName: orderDetail.productVariant.baseProduct.name,
            productImage: orderDetail.productVariant.image,
            optionValue: orderDetail.productVariant.optionValueVariants.map(
              (optionValueVariant) => optionValueVariant.optionValue.value,
            ),
            quantity: orderDetail.quantity,
            price: orderDetail.productVariant.price,
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
          return {
            id: orderDetail.id,
            productName: orderDetail.productVariant.baseProduct.name,
            productImage: orderDetail.productVariant.image,
            optionValue: orderDetail.productVariant.optionValueVariants.map(
              (optionValueVariant) => optionValueVariant.optionValue.value,
            ),
            quantity: orderDetail.quantity,
            price: orderDetail.productVariant.price,
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
}
