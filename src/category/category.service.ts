import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCategoryDto } from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import {
  CategoryResponseDto,
  ProductVariantResponseDto,
} from './dto/response.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories() {
    const categories = await this.prisma.category.findMany();
    return categories;
  }

  async addCategory(addCategoryDto: AddCategoryDto) {
    try {
      const category = await this.prisma.category.create({
        data: {
          Name: addCategoryDto.name,
          Image: addCategoryDto.image,
          Slug: normalizeName(addCategoryDto.name),
          Description: addCategoryDto.description,
        },
      });
      return category;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category name must be unique');
      } else {
        throw error;
      }
    }
  }

  async getBySlug(slug: string, limit: number = 100) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { Slug: slug },
        include: {
          baseProducts: {
            include: {
              productVariants: {
                select: {
                  Id: true,
                  Image: true,
                  prices: {
                    orderBy: {
                      UpdatedAt: 'desc',
                    },
                    take: 1,
                    select: {
                      Price: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const variants: ProductVariantResponseDto[] = [];

      category.baseProducts.map((baseProduct) =>
        baseProduct.productVariants.map((variant) => {
          if (variants.length < limit) {
            variants.push({
              id: baseProduct.Id,
              slug: baseProduct.Slug,
              name: baseProduct.Name,
              variantId: variant.Id,
              image: variant.Image,
              price: variant.prices[0].Price,
            });
          } else {
            return;
          }
        }),
      );

      const response: CategoryResponseDto = {
        id: category.Id,
        slug: category.Slug,
        name: category.Name,
        image: category.Image,
        description: category.Description,
        products: variants,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }
}
