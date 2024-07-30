import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO, SignUpDto } from './dto';
import { JwtGuard, RefreshTokenGuard } from './guard';
import { GetUser } from './decorator';
import { UpdatePasswordDto } from './dto/password.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() authDto: AuthDTO) {
    return this.authService.signIn(authDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  refreshToken(@GetUser('phoneNumber') phoneNumber: string) {
    return this.authService.refreshToken(phoneNumber);
  }

  @HttpCode(HttpStatus.OK)
  @Put('update-password')
  @UseGuards(JwtGuard)
  updatePassword(
    @GetUser('id') userId: number,
    @Body() requestBody: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(userId, requestBody);
  }
}
