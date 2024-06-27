import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto';
import { PaymentStatus } from 'src/constants/enum';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // async createPayment(orderId: number, createPaymentDto: CreatePaymentDto) {
  //   try {
  //     const payment = await this.prisma.payment.create({
  //       data: {
  //         Amount: createPaymentDto.amount,
  //         PaymentMethod: createPaymentDto.paymentMethod,
  //         Status: createPaymentDto.status,
  //         OrderId: orderId,
  //         PaymentDate: createPaymentDto.paymentDate,
  //         TransactionId: createPaymentDto.transactionId,
  //       },
  //     });
  //     return payment;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async updatePayment(
  //   paymentId: number,
  //   status: PaymentStatus,
  //   paymentDate?: Date,
  //   transactionId?: string,
  // ) {
  //   try {
  //     const payment = await this.prisma.payment.update({
  //       where: { Id: paymentId },
  //       data: {
  //         PaymentDate: paymentDate,
  //         Status: status,
  //         TransactionId: transactionId,
  //       },
  //     });
  //     return payment;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
