import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCategoryDto, UpdateCategoryDto } from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import {
  AllCategoryResponse,
  CategoryProductResponse,
  ClientAllCategoryResponse,
  ClientCategoryProductResponse,
} from './dto/response.dto';
import { OrderStatus } from 'src/constants/enum';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private productService: ProductService,
  ) {}

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

  async getClientAllCategories(): Promise<ClientAllCategoryResponse[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        parent: null,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        children: {
          select: {
            id: true,
            slug: true,
            name: true,
            image: true,
          },
        },
      },
    });
    const productPromises = categories.map((category) => {
      return this.productService.getProductsByCategorySlug(category.slug);
    });

    const productResults = await Promise.all(productPromises);

    const response: ClientAllCategoryResponse[] = categories.map(
      (category, index) => {
        return {
          id: category.id,
          slug: category.slug,
          name: category.name,
          image: category.image,
          children: category.children,
          products: productResults[index],
        };
      },
    );
    return response;
  }

  async getCategoryChildren(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        slug: slug,
      },
      select: {
        children: {
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
        },
      },
    });
    const response: AllCategoryResponse[] = category.children.map(
      (category) => {
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
      },
    );
    return response;
  }

  async getCategoryProducts(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        slug: slug,
      },
      select: {
        baseProductCategories: {
          select: {
            baseProduct: {
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
        },
      },
    });
    const response: CategoryProductResponse[] =
      category.baseProductCategories.map((baseProductCategory) => {
        const product = baseProductCategory.baseProduct;
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
