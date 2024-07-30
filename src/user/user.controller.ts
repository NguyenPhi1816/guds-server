import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRoles } from 'src/constants/enum';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import {
  UpdateUserInforRequestDto,
  UpdateUserStatusRequestDto,
} from './dto/request';

@UseGuards(JwtGuard)
@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('profile')
  getProfile(@GetUser() user: User) {
    return user;
  }

  @Put()
  @UseGuards(JwtGuard)
  updateUserInfo(
    @GetUser('id') userId: number,
    @Body() requestBody: UpdateUserInforRequestDto,
  ) {
    return this.userService.UpdateUserInfo(userId, requestBody);
  }

  @Put('/status')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  updateUserStatus(
    @Body() updateUserStatusRequestDto: UpdateUserStatusRequestDto,
  ) {
    return this.userService.updateUserStatus(updateUserStatusRequestDto);
  }
}
