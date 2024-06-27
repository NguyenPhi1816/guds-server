import { ConflictException, Injectable } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/constants/enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDetailDto, CreateOrderDto } from './dto';
import { PaymentService } from 'src/payment/payment.service';
import { CreatePaymentDto } from 'src/payment/dto';
import { ProductService } from 'src/product/product.service';
import { UpdateQuantityType } from 'src/constants/enum/update-quantiy-type.enum';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
    private productService: ProductService,
  ) {}

  // async createOrderDetail(
  //   orderId: number,
  //   createOrderDetailDto: CreateOrderDetailDto,
  // ) {
  //   try {
  //     const productVariant = await this.prisma.productVariant.findUnique({
  //       where: { Id: createOrderDetailDto.productVariantId },
  //       select: {
  //         Quantity: true,
  //         baseProduct: {
  //           select: {
  //             Name: true,
  //           },
  //         },
  //       },
  //     });

  //     if (productVariant.Quantity < createOrderDetailDto.quantity) {
  //       throw new ConflictException(
  //         `The quantity of product ${productVariant.baseProduct.Name} is not enough to make a purchase`,
  //       );
  //     }

  //     const orderDetail = await this.prisma.orderDetail.create({
  //       data: {
  //         OrderId: orderId,
  //         ProductVariantId: createOrderDetailDto.productVariantId,
  //         Quantity: createOrderDetailDto.quantity,
  //       },
  //       include: {
  //         productVariant: {
  //           select: {
  //             prices: {
  //               orderBy: {
  //                 UpdatedAt: 'desc',
  //               },
  //               take: 1,
  //               select: {
  //                 Price: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });
  //     return orderDetail;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async createOrder(userId: number, createOrderDto: CreateOrderDto) {
  //   try {
  //     // save order
  //     const order = await this.prisma.order.create({
  //       data: {
  //         Status: OrderStatus.PENDING,
  //         CreateAt: new Date(),
  //         Note: createOrderDto.note,
  //         UserId: userId,
  //       },
  //     });

  //     // create order details
  //     const orderDetailPromises = createOrderDto.orderDetails.map(
  //       (orderDetail) => this.createOrderDetail(order.Id, orderDetail),
  //     );

  //     const orderDetails = await Promise.all(orderDetailPromises);

  //     // update quantity
  //     const quantityUpdatePromises = orderDetails.map((detail) =>
  //       this.productService.updateQuantity(
  //         detail.ProductVariantId,
  //         detail.Quantity,
  //         UpdateQuantityType.decrement,
  //       ),
  //     );

  //     await Promise.all(quantityUpdatePromises);

  //     // create payment
  //     const totalPrice = orderDetails.reduce(
  //       (prev, detail) => prev + detail.productVariant.prices[0].Price,
  //       0,
  //     );

  //     const createPaymentDto: CreatePaymentDto = {
  //       amount: totalPrice,
  //       paymentDate: createOrderDto.paymentDate
  //         ? new Date(createOrderDto.paymentDate)
  //         : null,
  //       paymentMethod: createOrderDto.paymentMethod,
  //       status:
  //         createOrderDto.paymentMethod === PaymentMethod.CASH
  //           ? PaymentStatus.PENDING
  //           : PaymentStatus.SUCCESS,
  //       transactionId: createOrderDto.transactionId,
  //     };
  //     const payment = await this.paymentService.createPayment(
  //       order.Id,
  //       createPaymentDto,
  //     );

  //     return { order, orderDetails, payment };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async updateOrder(myOrderId: string, status: string) {
  //   try {
  //     const orderId = Number.parseInt(myOrderId);

  //     const _order = await this.prisma.order.findUnique({
  //       where: { Id: orderId },
  //       select: { Status: true },
  //     });

  //     if (_order.Status !== OrderStatus.PENDING) {
  //       throw new ConflictException('Unable to update order.');
  //     }

  //     switch (status) {
  //       case OrderStatus.SUCCESS: {
  //         const order = await this.prisma.order.update({
  //           where: { Id: orderId },
  //           data: { Status: OrderStatus.SUCCESS },
  //           include: {
  //             payment: {
  //               select: {
  //                 Id: true,
  //                 PaymentMethod: true,
  //               },
  //             },
  //             orderDetails: true,
  //           },
  //         });
  //         if (order.payment.PaymentMethod === PaymentMethod.CASH) {
  //           const payment = await this.paymentService.updatePayment(
  //             order.payment.Id,
  //             PaymentStatus.SUCCESS,
  //             new Date(),
  //             null,
  //           );
  //           delete order.payment;
  //           return { ...order, payment };
  //         }
  //         return order;
  //       }
  //       case OrderStatus.CANCEL: {
  //         // update order status to CANCEL
  //         const order = await this.prisma.order.update({
  //           where: { Id: orderId },
  //           data: { Status: OrderStatus.CANCEL },
  //           include: {
  //             payment: {
  //               select: {
  //                 Id: true,
  //                 PaymentMethod: true,
  //               },
  //             },
  //             orderDetails: true,
  //           },
  //         });

  //         // update quantity
  //         const updateQuantityPromises = order.orderDetails.map((detail) =>
  //           this.productService.updateQuantity(
  //             detail.ProductVariantId,
  //             detail.Quantity,
  //             UpdateQuantityType.increment,
  //           ),
  //         );
  //         await Promise.all(updateQuantityPromises);

  //         // update payment status to CANCEL (check by cash) or REFUND (check by another method)
  //         if (order.payment.PaymentMethod === PaymentMethod.CASH) {
  //           const payment = await this.paymentService.updatePayment(
  //             order.payment.Id,
  //             PaymentStatus.CANCEL,
  //             null,
  //             null,
  //           );
  //           delete order.payment;
  //           return { ...order, payment };
  //         } else {
  //           const payment = await this.paymentService.updatePayment(
  //             order.payment.Id,
  //             PaymentStatus.REFUND,
  //             new Date(),
  //             'refunded-transaction-id',
  //           );
  //           delete order.payment;
  //           return { ...order, payment };
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
