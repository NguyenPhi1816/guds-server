import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCategoryDto, UpdateCategoryDto } from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import {
  CategoryResponseDto,
  ProductVariantResponseDto,
} from './dto/response.dto';
import internal from 'stream';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null },
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        description: true,
        children: {
          select: {
            id: true,
            slug: true,
            name: true,
            image: true,
            description: true,
          },
        },
      },
    });
    return categories;
  }

  async addCategory(addCategoryDto: AddCategoryDto) {
    try {
      const category = await this.prisma.category.create({
        data: {
          name: addCategoryDto.name,
          image: addCategoryDto.image,
          slug: normalizeName(addCategoryDto.name),
          description: addCategoryDto.description,
          parentId: addCategoryDto.parentId,
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

  async updateCategory(updateCategoryDto: UpdateCategoryDto) {
    try {
      console.log(updateCategoryDto);

      const category = await this.prisma.category.update({
        where: { id: updateCategoryDto.id },
        data: {
          name: updateCategoryDto.name,
          slug: normalizeName(updateCategoryDto.name),
          image: updateCategoryDto.image,
          description: updateCategoryDto.description,
          parentId: updateCategoryDto.parentId,
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
        where: { slug: slug },
        include: {
          baseProductCategories: {
            take: limit,
            select: {
              baseProduct: {
                select: {
                  productVariants: true,
                },
              },
            },
          },
          // baseProducts: {
          //   include: {
          //     productVariants: {
          //       select: {
          //         Id: true,
          //         Image: true,
          //         prices: {
          //           orderBy: {
          //             UpdatedAt: 'desc',
          //           },
          //           take: 1,
          //           select: {
          //             Price: true,
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
        },
      });

      // const variants: ProductVariantResponseDto[] = [];

      // category.baseProducts.map((baseProduct) =>
      //   baseProduct.productVariants.map((variant) => {
      //     if (variants.length < limit) {
      //       variants.push({
      //         id: baseProduct.Id,
      //         slug: baseProduct.Slug,
      //         name: baseProduct.Name,
      //         variantId: variant.Id,
      //         image: variant.Image,
      //         price: variant.prices[0].Price,
      //       });
      //     } else {
      //       return;
      //     }
      //   }),
      // );

      // const response: CategoryResponseDto = {
      //   id: category.Id,
      //   slug: category.Slug,
      //   name: category.Name,
      //   image: category.Image,
      //   description: category.Description,
      //   products: variants,
      // };

      return category;
    } catch (error) {
      throw error;
    }
  }

  async addBaseProductToCategory(
    prisma: any,
    baseProductId: number,
    categoryId: number,
  ) {
    try {
      const baseProductCategory = await prisma.baseProductCategory.create({
        data: {
          categoryId: categoryId,
          baseProductId: baseProductId,
        },
        select: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      return baseProductCategory.category;
    } catch (error) {
      throw error;
    }
  }
}
