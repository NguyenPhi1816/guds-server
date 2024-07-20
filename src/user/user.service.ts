import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserResponseDto } from './dto/response';
import { UpdateUserStatusRequestDto } from './dto/request';

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
}
