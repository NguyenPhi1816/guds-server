import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async addBaseProductImage(
    prisma: any,
    baseProductId: number,
    path: string,
    isDefault: boolean,
  ) {
    try {
      return prisma.baseProductImage.create({
        data: {
          baseProductId: baseProductId,
          path: path,
          isDefault: isDefault,
        },
        select: {
          id: true,
          path: true,
          isDefault: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
