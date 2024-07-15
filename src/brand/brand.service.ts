import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import {
  BasicBrandResponseDto,
  BrandProductResponse,
} from './dto/response.dto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async getAllBrands() {
    const brands = await this.prisma.brand.findMany({
      include: {
        _count: {
          select: {
            baseProducts: true,
          },
        },
      },
    });
    const response: BasicBrandResponseDto[] = brands.map((brand) => ({
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      image: brand.image,
      numberOfProducts: brand._count.baseProducts,
    }));
    return response;
  }

  async getBrandProduct(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug: slug },
      select: {
        baseProducts: {
          select: {
            id: true,
            slug: true,
            name: true,
            baseProductCategories: {
              select: {
                category: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                  },
                },
              },
            },
            brand: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
            status: true,
          },
        },
      },
    });
    const response: BrandProductResponse[] = brand.baseProducts.map(
      (product) => {
        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.baseProductCategories.map((baseProductCategory) => {
            const category = baseProductCategory.category;
            return {
              id: category.id,
              slug: category.slug,
              name: category.name,
            };
          }),
          brand: product.brand,
          status: product.status,
        };
      },
    );
    return response;
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

  async createBrand(
    createBrandDto: CreateBrandDto,
  ): Promise<BasicBrandResponseDto> {
    try {
      const brand = await this.prisma.brand.create({
        data: {
          name: createBrandDto.name,
          slug: normalizeName(createBrandDto.name),
          image: createBrandDto.image,
        },
        include: {
          _count: {
            select: {
              baseProducts: true,
            },
          },
        },
      });
      const response: BasicBrandResponseDto = {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        image: brand.image,
        numberOfProducts: brand._count.baseProducts,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateBrand(
    updateBrandDto: UpdateBrandDto,
  ): Promise<BasicBrandResponseDto> {
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
        include: {
          _count: {
            select: {
              baseProducts: true,
            },
          },
        },
      });
      const response: BasicBrandResponseDto = {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        image: brand.image,
        numberOfProducts: brand._count.baseProducts,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }
}
