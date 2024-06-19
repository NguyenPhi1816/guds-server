import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRoles } from 'src/constants/enum';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CreateProductDto } from './dto';

@Controller('api/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  getAllBaseProduct() {
    return this.productService.getAllBaseProduct();
  }

  @Post()
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  createBaseProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createBaseProduct(createProductDto);
  }

  @Get('/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.productService.getBySlug(slug);
  }
}
