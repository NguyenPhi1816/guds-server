import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Response } from 'express';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@Controller('api/otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post('send')
  async sendOtp(@Body('phoneNumber') phoneNumber: string) {
    const res = await this.otpService.generateAndSendOtp(phoneNumber);
    return res;
  }

  @Post('verify')
  async verifyOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('otp') otp: string,
  ) {
    const res = await this.otpService.verifyOtp(phoneNumber, otp);
    return res;
  }
}
