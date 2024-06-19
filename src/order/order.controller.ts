import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { CreateOrderDto } from './dto';
import { OrderService } from './order.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRoles } from 'src/constants/enum';

@Controller('api/orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @UseGuards(JwtGuard)
  createOrder(
    @GetUser('Id') userId: number,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, createOrderDto);
  }

  @Patch('/:orderId/:status')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  updateOrder(
    @Param('orderId') orderId: string,
    @Param('status') status: string,
  ) {
    return this.orderService.updateOrder(orderId, status);
  }
}
