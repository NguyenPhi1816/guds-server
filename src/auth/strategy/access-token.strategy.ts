import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber: payload.phoneNumber,
      },
    });
    const role = await this.prisma.role.findUnique({
      where: { id: payload.userRoleId },
    });
    const extendedUser = user as any;
    extendedUser.roles = [role.name];
    return extendedUser;
  }
}
