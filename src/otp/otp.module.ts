import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';
import { OtpController } from './otp.controller';

@Module({
  imports: [EmailModule],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
