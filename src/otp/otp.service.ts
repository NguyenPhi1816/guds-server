import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  private otps = new Map();

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  async generateAndSendOtp(phoneNumber: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { phoneNumber: phoneNumber },
        select: {
          email: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `Can not find user with phone number: ${phoneNumber}`,
        );
      }

      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      this.otps.set(user.email, otp);
      setTimeout(
        () => this.otps.delete(user.email),
        this.configService.get<number>('EXPIRE_TIME'),
      );

      await this.emailService.sendMail(
        user.email,
        'Your OTP Code',
        `Your OTP code is ${otp}`,
      );
      return { status: 200, message: 'OTP sent to email' };
    } catch (error) {
      throw error;
    }
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: phoneNumber },
      select: {
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Can not find user with phone number: ${phoneNumber}`,
      );
    }

    const storedOtp = this.otps.get(user.email);
    if (storedOtp !== otp) {
      throw new BadRequestException(`Invalid OTP`);
    }
    this.otps.delete(user.email);
    return { status: 200, message: 'OTP verified' };
  }
}
