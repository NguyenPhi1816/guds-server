import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { FeedbackModule } from './feedback/feedback.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    ProductModule,
    PrismaModule,
    CategoryModule,
    CloudinaryModule,
    OrderModule,
    PaymentModule,
    FeedbackModule,
    CartModule,
  ],
})
export class AppModule {}
