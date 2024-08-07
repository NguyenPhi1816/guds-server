import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDTO, SignUpDto } from './dto';
import * as argon from 'argon2';
import { AccountStatus, UserRoles } from 'src/constants/enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UpdatePasswordByPhoneNumberDto,
  UpdatePasswordDto,
} from './dto/password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signIn(authDto: AuthDTO) {
    // find account by phone number
    const account = await this.prisma.account.findUnique({
      where: {
        userPhoneNumber: authDto.phoneNumber,
      },
    });

    // throw exception if account not found
    if (!account) {
      throw new UnauthorizedException('Phone number not found.');
    }

    // compare password
    const pwMatches = await argon.verify(account.password, authDto.password);

    // throw exception if password incorrect
    if (!pwMatches) {
      throw new UnauthorizedException('Password incorrect.');
    }

    return this.signTokens(account.id, account.userPhoneNumber, account.roleId);
  }

  async signUp(signUpDto: SignUpDto) {
    // generate the hashed password
    const hashedPassword = await argon.hash(signUpDto.password);

    // get user role with role name equal user
    const userRole = await this.prisma.role.findFirst({
      where: { name: UserRoles.USER },
    });

    try {
      // save user
      const user = await this.prisma.user.create({
        data: {
          firstName: signUpDto.firstName,
          lastName: signUpDto.lastName,
          address: signUpDto.address,
          dateOfBirth: new Date(signUpDto.dateOfBirth),
          email: signUpDto.email,
          phoneNumber: signUpDto.phoneNumber,
          gender: signUpDto.gender,
        },
      });

      // save account
      const account = await this.prisma.account.create({
        data: {
          userPhoneNumber: signUpDto.phoneNumber,
          password: hashedPassword,
          status: AccountStatus.ACTIVE,
          roleId: userRole.id,
        },
      });

      return { status: 201, message: 'Đăng ký tài khoản thành công' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Số điện thoại hoặc email đã tồn tại');
        }
      } else {
        throw error;
      }
    }
  }

  async refreshToken(userPhoneNumber: string) {
    const account = await this.prisma.account.findUnique({
      where: {
        userPhoneNumber: userPhoneNumber,
      },
    });
    return this.getNewAccessToken(
      account.id,
      account.userPhoneNumber,
      account.roleId,
    );
  }

  async signTokens(accountId: number, phoneNumber: string, userRoleId: number) {
    const payload = {
      sub: accountId,
      phoneNumber,
      userRoleId,
    };
    const accessSecret = this.config.get('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.get('JWT_REFRESH_SECRET');
    const accessExpire = this.config.get<number>('JWT_ACCESS_EXPIRE');
    const refreshExpire = this.config.get<number>('JWT_REFRESH_EXPIRE');

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: accessExpire,
      secret: accessSecret,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: refreshExpire,
      secret: refreshSecret,
    });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async getNewAccessToken(
    accountId: number,
    phoneNumber: string,
    userRoleId: number,
  ) {
    const payload = {
      sub: accountId,
      phoneNumber,
      userRoleId,
    };
    const accessSecret = this.config.get('JWT_ACCESS_SECRET');
    const accessExpire = this.config.get('JWT_ACCESS_EXPIRE');

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: accessExpire,
      secret: accessSecret,
    });
    return { access_token: accessToken };
  }

  async updatePassword(userId: number, requestBody: UpdatePasswordDto) {
    console.log(userId);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          account: true,
        },
      });

      // check old password
      const isOldPasswordMatched = await argon.verify(
        user.account.password,
        requestBody.oldPassword,
      );

      if (!isOldPasswordMatched) {
        throw new BadRequestException('Old password do not match.');
      }

      // generate the hashed password
      const hashedPassword = await argon.hash(requestBody.newPassword);

      await this.prisma.account.update({
        where: {
          id: user.account.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      return { status: 200, message: 'Update password successful.' };
    } catch (error) {
      throw error;
    }
  }

  async updatePasswordByPhoneNumber(
    requestBody: UpdatePasswordByPhoneNumberDto,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { phoneNumber: requestBody.phoneNumber },
        select: {
          account: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // generate the hashed password
      const hashedPassword = await argon.hash(requestBody.newPassword);

      await this.prisma.account.update({
        where: {
          id: user.account.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      return { status: 200, message: 'Update password successful.' };
    } catch (error) {
      throw error;
    }
  }
}
