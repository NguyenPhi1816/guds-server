import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import {
  CreateOrderDto,
  GetOrdersByUserIdParams,
  IdParam,
  UpdateOrderParams,
} from './dto';
import { OrderService } from './order.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRoles } from 'src/constants/enum';

@Controller('api/orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get('/me')
  @UseGuards(JwtGuard)
  getMyOrders(@GetUser('id') userId: number) {
    return this.orderService.getOrdersByUserId(userId);
  }

  @Get('/:userId')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  getOrdersByUserId(@Param() params: GetOrdersByUserIdParams) {
    return this.orderService.getOrdersByUserId(params.userId);
  }

  @Get('/detail/:id')
  @UseGuards(JwtGuard)
  getOrderDetailById(@Param() params: IdParam) {
    return this.orderService.getOrderDetailById(params.id);
  }

  @Post()
  @UseGuards(JwtGuard)
  createOrder(
    @GetUser('id') userId: number,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, createOrderDto);
  }

  @Put('/:orderId/:status')
  @UseGuards(JwtGuard)
  updateOrder(@Param() params: UpdateOrderParams) {
    return this.orderService.updateOrder(params.orderId, params.status);
  }
}
