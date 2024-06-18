import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRoles } from 'src/constants/enum';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import {
  AddBaseProductDto,
  AddProductOptionDto,
  CreateProductDto,
} from './dto';

@Controller('api/products')
export class ProductController {
  constructor(
    private productService: ProductService,
  ) {}

  @Get()
  getAllBaseProduct() {
    return this.productService.getAllBaseProduct();
  }

  @Post()
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  createBaseProduct(
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productService.createBaseProduct(
      createProductDto,
    );
  }

  // @Get('get-options/:categoryId')
  // getProductOptionsByCategoryId(
  //   @Param('categoryId') categoryId: string,
  // ) {
  //   return this.productService.getProductOptionsByCategoryId(
  //     categoryId,
  //   );
  // }

  // @Post('add-option')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(JwtGuard, RolesGuard)
  // addProductOption(
  //   @Body()
  //   addProductOptionDto: AddProductOptionDto,
  // ) {
  //   return this.productService.addProductOption(
  //     addProductOptionDto,
  //   );
  // }

  // @Post('add-base')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(JwtGuard, RolesGuard)
  // addBaseProduct(
  //   @Body()
  //   addBaseProductDto: AddBaseProductDto,
  // ) {
  //   return this.productService.addBaseProduct(
  //     addBaseProductDto,
  //   );
  // }
}
