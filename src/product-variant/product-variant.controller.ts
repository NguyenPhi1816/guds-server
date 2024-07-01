import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { GuardsConsumer } from '@nestjs/core/guards';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRoles } from 'src/constants/enum';
import {
  CreateProductVariantRequestDto,
  UpdatePriceRequestDto,
  UpdateQuantityRequestDto,
} from './dto/request.dto';
import { ProductVariantService } from './product-variant.service';

@Controller('api/product-variants')
export class ProductVariantController {
  constructor(private productVariantService: ProductVariantService) {}

  @Post()
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  createProductVariant(
    @Body() createProductVariantRequestDto: CreateProductVariantRequestDto,
  ) {
    return this.productVariantService.createProductVariant(
      createProductVariantRequestDto,
    );
  }

  @Post('/update-price')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  updatePrice(@Body() updatePriceRequestDto: UpdatePriceRequestDto) {
    return this.productVariantService.updatePrice(updatePriceRequestDto);
  }

  @Put('/update-quantity')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  updateQuantity(@Body() updateQuantityRequestDto: UpdateQuantityRequestDto) {
    return this.productVariantService.updateQuantity(updateQuantityRequestDto);
  }
}
