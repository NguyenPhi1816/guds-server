import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto/response';
import {
  UpdateUserInforRequestDto,
  UpdateUserStatusRequestDto,
} from './dto/request';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<UserResponseDto[]> {
    try {
      const users = await this.prisma.user.findMany({
        include: {
          account: {
            select: {
              status: true,
              userRole: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      const response: UserResponseDto[] = users.map((user) => {
        const status = user.account.status;
        const role = user.account.userRole.name;
        delete user.account;
        return {
          ...user,
          status: status,
          role: role,
        };
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateUserStatus(
    updateUserStatusRequestDto: UpdateUserStatusRequestDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: updateUserStatusRequestDto.userId,
        },
        data: {
          account: {
            update: {
              status: updateUserStatusRequestDto.status,
            },
          },
        },
        include: {
          account: {
            select: {
              status: true,
              userRole: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      const role = user.account.userRole.name;
      const status = user.account.status;
      delete user.account;
      const response: UserResponseDto = {
        ...user,
        role,
        status,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async UpdateUserInfo(userId: number, request: UpdateUserInforRequestDto) {
    try {
      const result = this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            firstName: request.firstName,
            lastName: request.lastName,
            phoneNumber: request.phoneNumber,
            email: request.email,
            dateOfBirth: new Date(request.dateOfBirth).toISOString(),
            address: request.address,
            gender: request.gender,
            image: request.image,
          },
          include: {
            account: {
              select: {
                id: true,
              },
            },
          },
        });
        if (user.phoneNumber !== request.phoneNumber) {
          throw new Error('Update user information failed.');
        }

        const account = await prisma.account.update({
          where: {
            id: user.account.id,
          },
          data: {
            userPhoneNumber: request.phoneNumber,
          },
          select: {
            status: true,
            userRole: {
              select: {
                name: true,
              },
            },
          },
        });

        const response: UserResponseDto = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          dateOfBirth: new Date(user.dateOfBirth),
          email: user.email,
          gender: user.gender,
          image: user.image,
          phoneNumber: user.phoneNumber,
          role: account.userRole.name,
          status: account.status,
        };

        return response;
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}
