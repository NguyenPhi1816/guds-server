import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDTO, SignUpDto } from './dto';
import * as argon from 'argon2';
import {
  AccountStatus,
  UserRoles,
} from 'src/constants/enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { use } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signIn(authDto: AuthDTO) {
    // find account by phone number
    const account =
      await this.prisma.account.findUnique({
        where: {
          UserPhoneNumber: authDto.phoneNumber,
        },
      });

    // throw exception if account not found
    if (!account) {
      throw new UnauthorizedException(
        'Phone number not found.',
      );
    }

    // compare password
    const pwMatches = await argon.verify(
      account.Password,
      authDto.password,
    );

    // throw exception if password incorrect
    if (!pwMatches) {
      throw new UnauthorizedException(
        'Password incorrect.',
      );
    }

    return this.signTokens(
      account.Id,
      account.UserPhoneNumber,
      account.UserRoleId,
    );
  }

  async signUp(signUpDto: SignUpDto) {
    // generate the hashed password
    const hashedPassword = await argon.hash(
      signUpDto.password,
    );

    // get user role with role name equal user
    const userRole =
      await this.prisma.userRole.findFirst({
        where: { Name: UserRoles.USER },
      });

    try {
      // save user
      await this.prisma.user.create({
        data: {
          FirstName: signUpDto.firstName,
          LastName: signUpDto.lastName,
          Address: signUpDto.address,
          DateOfBirth: new Date(
            signUpDto.dateOfBirth,
          ),
          Email: signUpDto.email,
          PhoneNumber: signUpDto.phoneNumber,
          Gender: signUpDto.gender,
        },
      });

      // save account
      const account =
        await this.prisma.account.create({
          data: {
            UserPhoneNumber:
              signUpDto.phoneNumber,
            Password: hashedPassword,
            Status: AccountStatus.ACTIVE,
            UserRoleId: userRole.Id,
          },
        });

      return this.signTokens(
        account.Id,
        account.UserPhoneNumber,
        account.UserRoleId,
      );
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Phone number or email already exists.',
          );
        }
      }
    }
  }

  async refreshToken(userPhoneNumber: string) {
    const account =
      await this.prisma.account.findUnique({
        where: {
          UserPhoneNumber: userPhoneNumber,
        },
      });
    return this.signTokens(
      account.Id,
      account.UserPhoneNumber,
      account.UserRoleId,
    );
  }

  async signTokens(
    accountId: number,
    phoneNumber: string,
    userRoleId: number,
  ) {
    const payload = {
      sub: accountId,
      phoneNumber,
      userRoleId,
    };
    const accessSecret = this.config.get(
      'JWT_ACCESS_SECRET',
    );
    const refreshSecret = this.config.get(
      'JWT_REFRESH_SECRET',
    );
    const accessToken = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: accessSecret,
      },
    );
    const refreshToken = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '1d',
        secret: refreshSecret,
      },
    );
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
