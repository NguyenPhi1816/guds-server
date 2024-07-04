import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ProductService } from 'src/product/product.service';
import { CategoryService } from 'src/category/category.service';
import { ImageService } from 'src/image/image.service';
import { OptionValueService } from 'src/option-value/option-value.service';
import { ProductVariantService } from 'src/product-variant/product-variant.service';
import { BrandService } from 'src/brand/brand.service';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    ProductService,
    CategoryService,
    ImageService,
    OptionValueService,
    ProductVariantService,
    BrandService,
  ],
})
export class OrderModule {}
