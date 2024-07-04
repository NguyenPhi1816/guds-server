import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { CartService } from './cart.service';
import { GetUser } from 'src/auth/decorator';
import {
  AddToCartRequestDto,
  DeleteCartParams,
  UpdateCartDetailQuantityParams,
  UpdateCartQuantityRequestDto,
} from './dto';

@Controller('api/carts')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(JwtGuard)
  getCartByUserId(@GetUser('id') userId: number) {
    return this.cartService.getCartByUserId(userId);
  }

  @Post()
  @UseGuards(JwtGuard)
  addProductToCart(
    @GetUser('id') userId: number,
    @Body() addToCartRequestDto: AddToCartRequestDto,
  ) {
    return this.cartService.addProductToCart(userId, addToCartRequestDto);
  }

  @Patch('/:productVariantId')
  @UseGuards(JwtGuard)
  updateCartDetailQuantity(
    @GetUser('id') userId: number,
    @Param() params: UpdateCartDetailQuantityParams,
    @Body() updateCartQuantityRequestDto: UpdateCartQuantityRequestDto,
  ) {
    return this.cartService.updateCartQuantity(
      userId,
      params.productVariantId,
      updateCartQuantityRequestDto,
    );
  }

  @Delete('/:productVariantId')
  @UseGuards(JwtGuard)
  deleteCartDetail(
    @GetUser('id') userId: number,
    @Param() params: DeleteCartParams,
  ) {
    return this.cartService.deleteCart(userId, params.productVariantId);
  }
}
