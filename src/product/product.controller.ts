import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRoles } from 'src/constants/enum';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CreateBaseProductDto } from './dto';

@Controller('api/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  // @Get()
  // getAllBaseProduct() {
  //   return this.productService.getAllBaseProduct();
  // }

  @Post()
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  createBaseProduct(@Body() createBaseProductDto: CreateBaseProductDto) {
    return this.productService.createBaseProduct(createBaseProductDto);
  }

  // @Get('/:slug')
  // getBySlug(@Param('slug') slug: string) {
  //   return this.productService.getBySlug(slug);
  // }

  // @Get('/category/:slug')
  // getBaseProductsByCategorySlug(@Param('slug') slug: string) {
  //   return this.productService.getBaseProductsByCategorySlug(slug);
  // }
}
