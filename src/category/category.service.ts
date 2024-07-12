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
  AllCategoryResponse,
  CategoryResponse,
  CategoryResponseDto,
  ProductVariantResponseDto,
} from './dto/response.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories(): Promise<AllCategoryResponse[]> {
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        description: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            baseProductCategories: true,
            children: true,
          },
        },
      },
    });
    const response: AllCategoryResponse[] = categories.map((category) => {
      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        image: category.image,
        description: category.description,
        parent: category.parent,
        numberOfBaseProduct: category._count.baseProductCategories,
        numberOfChildren: category._count.children,
      };
    });
    return response;
  }

  async addCategory(
    addCategoryDto: AddCategoryDto,
  ): Promise<AllCategoryResponse> {
    try {
      const category = await this.prisma.category.create({
        data: {
          name: addCategoryDto.name,
          image: addCategoryDto.image,
          slug: normalizeName(addCategoryDto.name),
          description: addCategoryDto.description,
          parentId: addCategoryDto.parentId,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          description: true,
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              baseProductCategories: true,
              children: true,
            },
          },
        },
      });
      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        image: category.image,
        description: category.description,
        parent: category.parent,
        numberOfBaseProduct: category._count.baseProductCategories,
        numberOfChildren: category._count.children,
      };
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
                include: {
                  productVariants: true,
                },
              },
            },
          },
        },
      });
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
