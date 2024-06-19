import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryService } from 'src/category/category.service';

@Module({
  providers: [ProductService, CategoryService],
  controllers: [ProductController],
})
export class ProductModule {}
