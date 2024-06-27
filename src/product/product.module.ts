import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryService } from 'src/category/category.service';
import { ProductVariantService } from 'src/product-variant/product-variant.service';
import { BrandService } from 'src/brand/brand.service';
import { OptionValueService } from 'src/option-value/option-value.service';
import { ImageService } from 'src/image/image.service';

@Module({
  providers: [
    ProductService,
    CategoryService,
    BrandService,
    ProductVariantService,
    OptionValueService,
    ImageService,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
