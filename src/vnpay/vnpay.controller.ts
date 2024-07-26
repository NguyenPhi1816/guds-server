import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { Response } from 'express';
import { CreatePaymentUrlRequestDto } from './dto/request';
import { JwtGuard } from 'src/auth/guard';

@Controller('api/vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @UseGuards(JwtGuard)
  @Post('create_payment_url')
  createPaymentUrl(
    @Body()
    body: CreatePaymentUrlRequestDto,
  ) {
    const { amount, orderId, orderDescription } = body;
    return this.vnpayService.createPaymentUrl(
      amount,
      orderId,
      orderDescription,
    );
  }

  // @Get('vnpay_ipn')
  // vnpayIpn(@Query() query: any, @Res() res: Response) {
  //   return this.vnpayService.verifyPayment(query);
  // }

  @Get('vnpay-return')
  @Render('redirect')
  async vnpayReturn(@Query() query: any) {
    const code = await this.vnpayService.verifyReturnUrl(query);
    if (code === '00') {
      return { status: 'success', code };
    } else {
      return { status: 'failed', code };
    }
  }
}
