import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { ProductService } from 'src/product/product.service';

@Module({
  providers: [BrandService, ProductService],
  controllers: [BrandController],
})
export class BrandModule {}
