import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO, SignUpDto } from './dto';
import { RefreshTokenGuard } from './guard';
import { GetUser } from './decorator';

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
    console.log(phoneNumber);

    return this.authService.refreshToken(phoneNumber);
  }
}
