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
import { AddToCartDto } from './dto';

@Controller('api/carts')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(JwtGuard)
  getCartByUserId(@GetUser('Id') userId: number) {
    return this.cartService.getCartByUserId(userId);
  }

  @Post()
  @UseGuards(JwtGuard)
  addProductToCart(
    @GetUser('Id') userId: number,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addProductToCart(userId, addToCartDto);
  }

  @Patch('/:cartDetailId/:type')
  @UseGuards(JwtGuard)
  updateCartDetailQuantity(
    @Param('cartDetailId') cartDetailId: string,
    @Param('type') type: string,
  ) {
    return this.cartService.updateCartDetailQuantity(cartDetailId, type);
  }

  @Delete('/:cartDetailId')
  @UseGuards(JwtGuard)
  deleteCartDetail(@Param('cartDetailId') cartDetailId: string) {
    return this.cartService.deleteCartDetail(cartDetailId);
  }
}
