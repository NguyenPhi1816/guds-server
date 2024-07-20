import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { GuardsConsumer } from '@nestjs/core/guards';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRoles } from 'src/constants/enum';
import {
  CreateProductVariantRequestDto,
  UpdateVariantRequestDto,
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

  @Put()
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  updateProductVariant(
    @Body() updateVariantRequestDto: UpdateVariantRequestDto,
  ) {
    return this.productVariantService.updateVariant(updateVariantRequestDto);
  }
}
