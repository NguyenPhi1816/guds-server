import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from 'src/user/dto/response';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber: payload.phoneNumber,
      },
      include: {
        account: {
          select: {
            status: true,
          },
        },
      },
    });
    const role = await this.prisma.role.findUnique({
      where: { id: payload.userRoleId },
    });
    const status = user.account.status;
    delete user.account;
    const extendedUser: UserResponseDto = {
      ...user,
      role: role.name,
      status,
    };
    return extendedUser;
  }
}
