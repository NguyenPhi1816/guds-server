import { ConflictException, Injectable } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/constants/enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto';

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
          return prev && productVariants[index].quantity > orderDetail.quantity;
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
                    prices: {
                      orderBy: {
                        updatedAt: 'desc',
                      },
                      take: 1,
                      select: {
                        price: true,
                      },
                    },
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
            prev + detail.productVariant.prices[0].price * detail.quantity,
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
      const response = this.prisma.$transaction(async (prisma) => {
        switch (status) {
          case OrderStatus.SUCCESS: {
            const order = await prisma.order.update({
              where: { id: orderId },
              data: { status: OrderStatus.SUCCESS },
              include: {
                payment: {
                  select: {
                    id: true,
                    paymentMethod: true,
                  },
                },
                orderDetails: true,
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
              include: {
                payment: {
                  select: {
                    id: true,
                    paymentMethod: true,
                  },
                },
                orderDetails: true,
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
              });
              delete order.payment;
              return { ...order, payment };
            }
          }
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}
