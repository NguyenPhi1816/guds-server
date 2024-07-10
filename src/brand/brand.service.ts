import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import { BasicBrandResponseDto } from './dto/response.dto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async getAllBrands() {
    const brands = await this.prisma.brand.findMany();
    return brands;
  }

  async getBrandBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug: slug },
      include: {
        baseProducts: {
          include: {
            productVariants: true,
          },
        },
      },
    });
    return brand;
  }

  async getBrandById(prisma: any, id: number): Promise<BasicBrandResponseDto> {
    const brand = await prisma.brand.findUnique({
      where: { id: id },
      select: {
        slug: true,
        name: true,
        image: true,
      },
    });
    return brand;
  }

  async createBrand(createBrandDto: CreateBrandDto) {
    try {
      const brand = await this.prisma.brand.create({
        data: {
          name: createBrandDto.name,
          slug: normalizeName(createBrandDto.name),
          image: createBrandDto.image,
        },
      });
      return brand;
    } catch (error) {
      throw error;
    }
  }

  async updateBrand(updateBrandDto: UpdateBrandDto) {
    try {
      const brand = await this.prisma.brand.update({
        where: {
          id: updateBrandDto.id,
        },
        data: {
          name: updateBrandDto.name,
          slug: normalizeName(updateBrandDto.name),
          image: updateBrandDto.image,
        },
      });
      return brand;
    } catch (error) {
      throw error;
    }
  }
}
