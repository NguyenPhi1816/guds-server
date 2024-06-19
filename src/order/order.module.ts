import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PaymentService } from 'src/payment/payment.service';
import { ProductService } from 'src/product/product.service';
import { CategoryService } from 'src/category/category.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PaymentService, ProductService, CategoryService],
})
export class OrderModule {}
