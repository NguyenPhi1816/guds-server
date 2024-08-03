import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRoles } from 'src/constants/enum';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import {
  CreateBaseProductDto,
  NameParam,
  SlugParam,
  UpdateBaseProductDto,
  UpdateBaseProductStatusRequestDto,
} from './dto';

@Controller('api/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  getAllBaseProduct() {
    return this.productService.getAllBaseProduct();
  }

  @Get('/:slug')
  getBySlug(@Param() param: SlugParam) {
    return this.productService.getBySlug(param.slug);
  }

  @Get('/category/:slug')
  getBaseProductsByCategorySlug(@Param() param: SlugParam) {
    return this.productService.getProductsByCategorySlug(param.slug);
  }

  @Get('/brand/:slug')
  getBaseProductsByBrandSlug(@Param() param: SlugParam) {
    return this.productService.getProductsByBrandSlug(param.slug);
  }

  @Get('/search/:name')
  searchProductByName(
    @Param() param: NameParam,
    @Query('fromPrice') fromPrice?: number,
    @Query('toPrice') toPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.productService.searchProductByName(
      param.name,
      fromPrice,
      toPrice,
      sortBy,
      page,
      limit,
    );
  }

  @Post()
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  createBaseProduct(@Body() createBaseProductDto: CreateBaseProductDto) {
    return this.productService.createBaseProduct(createBaseProductDto);
  }

  @Put()
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  updateBaseProduct(@Body() updateBaseProductDto: UpdateBaseProductDto) {
    return this.productService.updateBaseProduct(updateBaseProductDto);
  }

  @Put('/status')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  updateBaseProductStatus(
    @Body()
    updateBaseProductStatusRequestDto: UpdateBaseProductStatusRequestDto,
  ) {
    return this.productService.updateBaseProductStatus(
      updateBaseProductStatusRequestDto,
    );
  }
}
