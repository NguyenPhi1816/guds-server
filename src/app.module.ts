import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { BrandModule } from './brand/brand.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { OptionValueModule } from './option-value/option-value.module';
import { ImageModule } from './image/image.module';
import { ReviewModule } from './review/review.module';
import { VnpayModule } from './vnpay/vnpay.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    ProductModule,
    PrismaModule,
    CategoryModule,
    CloudinaryModule,
    OrderModule,
    CartModule,
    BrandModule,
    ProductVariantModule,
    OptionValueModule,
    ImageModule,
    ReviewModule,
    VnpayModule,
  ],
})
export class AppModule {}
