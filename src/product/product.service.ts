import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseProductImagesResponseDto,
  BaseProductResponseDto,
  BaseProductVariantDto,
  BasicBaseProductResponseDto,
  CreateBaseProductDto,
  OptionValueResponseDto,
  OptionValuesResponseDto,
  ProductVariantResponseDto,
  UpdateBaseProductDto,
  UpdateBaseProductStatusRequestDto,
} from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import { BaseProductStatus } from 'src/constants/enum/base-product-status.enum';
import { OrderStatus } from 'src/constants/enum';
import { UpdateQuantityType } from 'src/constants/enum/update-quantiy-type.enum';
import { OrderBySearchParams } from 'src/constants/enum/orderBySearchParams';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async getAllBaseProduct(): Promise<BasicBaseProductResponseDto[]> {
    try {
      const baseProducts = await this.prisma.baseProduct.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          brand: true,
          status: true,
          baseProductCategories: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const responses: BasicBaseProductResponseDto[] = baseProducts.map(
        (item) => {
          const categories: string[] = item.baseProductCategories.map(
            (baseProductCategory) => baseProductCategory.category.name,
          );

          return {
            id: item.id,
            slug: item.slug,
            name: item.name,
            categories: categories,
            brand: item.brand.name,
            status: item.status,
          };
        },
      );
      return responses;
    } catch (error) {
      throw error;
    }
  }

  async createBaseProduct(
    createBaseProductDto: CreateBaseProductDto,
  ): Promise<BasicBaseProductResponseDto> {
    try {
      // start transaction for multi query
      const newBaseProduct = await this.prisma.$transaction(async (prisma) => {
        // save base product
        const baseProduct = await prisma.baseProduct.create({
          data: {
            name: createBaseProductDto.name,
            slug: normalizeName(createBaseProductDto.name),
            description: createBaseProductDto.description,
            status: BaseProductStatus.ACTIVE,
            brandId: createBaseProductDto.brandId,
          },
          include: {
            brand: true,
          },
        });

        // add product to category
        const baseProductCategoryPromises =
          createBaseProductDto.categoryIds.map((categoryId) =>
            prisma.baseProductCategory.create({
              data: { baseProductId: baseProduct.id, categoryId: categoryId },
              include: {
                category: true,
              },
            }),
          );
        const baseProductCategories = await Promise.all(
          baseProductCategoryPromises,
        );

        // save all images from base product
        const imagePromises = createBaseProductDto.images.map((path, index) =>
          prisma.baseProductImage.create({
            data: {
              baseProductId: baseProduct.id,
              path: path,
              isDefault: index === 0,
            },
          }),
        );
        const baseProductImages: BaseProductImagesResponseDto[] =
          await Promise.all(imagePromises);

        const response: BasicBaseProductResponseDto = {
          id: baseProduct.id,
          slug: baseProduct.slug,
          name: baseProduct.name,
          status: baseProduct.status,
          categories: baseProductCategories.map(
            (baseProductCategory) => baseProductCategory.category.name,
          ),
          brand: baseProduct.brand.name,
        };
        return response;
      });
      return newBaseProduct;
    } catch (error) {
      console.log(error.code);

      if (error.code === 'P2002') {
        throw new ConflictException('Product name must be unique');
      } else {
        throw error;
      }
    }
  }

  async updateBaseProduct(
    updateBaseProduct: UpdateBaseProductDto,
  ): Promise<BasicBaseProductResponseDto> {
    try {
      // start transaction for multi query
      const newBaseProduct = await this.prisma.$transaction(async (prisma) => {
        // update base product
        const baseProduct = await prisma.baseProduct.update({
          where: {
            id: updateBaseProduct.id,
          },
          data: {
            name: updateBaseProduct.name,
            slug: normalizeName(updateBaseProduct.name),
            description: updateBaseProduct.description,
            status: BaseProductStatus.ACTIVE,
            brandId: updateBaseProduct.brandId,
          },
          include: {
            brand: true,
          },
        });

        // update product category
        await prisma.baseProductCategory.deleteMany({
          where: {
            baseProductId: updateBaseProduct.id,
          },
        });
        const baseProductCategoryPromises = updateBaseProduct.categoryIds.map(
          (categoryId) =>
            prisma.baseProductCategory.create({
              data: { baseProductId: baseProduct.id, categoryId: categoryId },
              include: {
                category: true,
              },
            }),
        );
        const baseProductCategories = await Promise.all(
          baseProductCategoryPromises,
        );

        // update base product images
        await prisma.baseProductImage.deleteMany({
          where: {
            baseProductId: updateBaseProduct.id,
          },
        });
        const imagePromises = updateBaseProduct.images.map((path, index) =>
          prisma.baseProductImage.create({
            data: {
              baseProductId: baseProduct.id,
              path: path,
              isDefault: index === 0,
            },
          }),
        );
        const baseProductImages: BaseProductImagesResponseDto[] =
          await Promise.all(imagePromises);

        const response: BasicBaseProductResponseDto = {
          id: baseProduct.id,
          slug: baseProduct.slug,
          name: baseProduct.name,
          status: baseProduct.status,
          categories: baseProductCategories.map(
            (baseProductCategory) => baseProductCategory.category.name,
          ),
          brand: baseProduct.brand.name,
        };
        return response;
      });
      return newBaseProduct;
    } catch (error) {
      console.log(error.code);

      if (error.code === 'P2002') {
        throw new ConflictException('Product name must be unique');
      } else {
        throw error;
      }
    }
  }

  async updateBaseProductStatus(
    updateBaseProductStatusRequestDto: UpdateBaseProductStatusRequestDto,
  ) {
    try {
      const baseProduct = await this.prisma.baseProduct.update({
        where: {
          id: updateBaseProductStatusRequestDto.id,
        },
        data: {
          status: updateBaseProductStatusRequestDto.status,
        },
      });
      return baseProduct;
    } catch (error) {
      throw error;
    }
  }

  async getSummary(baseProductSlug: string) {
    try {
      // Define the common where clause to be used in all queries
      const whereClause = {
        orderDetail: {
          productVariant: {
            baseProduct: {
              slug: baseProductSlug,
            },
          },
        },
      };

      // Define queries
      const numberOfReviewsQuery = this.prisma.review.count({
        where: whereClause,
      });

      const averageRatingQuery = this.prisma.review.aggregate({
        where: whereClause,
        _avg: {
          rating: true,
        },
      });

      const numberOfPurchasesQuery = this.prisma.orderDetail.aggregate({
        where: {
          productVariant: {
            baseProduct: {
              slug: baseProductSlug,
            },
          },
          order: {
            status: OrderStatus.SUCCESS,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      // Execute queries in parallel
      const [numberOfReviews, averageRatingResult, numberOfPurchasesResult] =
        await Promise.all([
          numberOfReviewsQuery,
          averageRatingQuery,
          numberOfPurchasesQuery,
        ]);

      // Extract results
      const averageRating = averageRatingResult._avg.rating ?? 0;
      const numberOfPurchases = numberOfPurchasesResult._sum.quantity ?? 0;

      return [numberOfReviews, averageRating, numberOfPurchases];
    } catch (error) {
      throw error;
    }
  }

  async getBySlug(slug: string) {
    try {
      // query by slug
      const product = await this.prisma.baseProduct.findUnique({
        where: { slug: slug },
        include: {
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
          brand: true,
          images: {
            select: {
              id: true,
              path: true,
              isDefault: true,
            },
          },
          productVariants: {
            select: {
              id: true,
              image: true,
              quantity: true,
              optionValueVariants: {
                select: {
                  optionValue: {
                    select: {
                      option: {
                        select: {
                          name: true,
                        },
                      },
                      value: true,
                    },
                  },
                  optionValueId: true,
                },
              },
              price: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      // get relate products by getting products from base product category, limit is 5 items
      const productsByCategorySlug = await this.getProductsByCategorySlug(
        product.baseProductCategories[0].category.slug,
        6,
      );

      // remove this product from related product
      let relatedProducts = [...productsByCategorySlug];
      const isProductContained = productsByCategorySlug
        .map((p) => p.id)
        .includes(product.id);
      if (isProductContained) {
        relatedProducts = relatedProducts.filter(
          (item) => item.id !== product.id,
        );
      } else {
        relatedProducts = relatedProducts.slice(0, 5);
      }

      // get product variants from base product
      const productVariants: BaseProductVariantDto[] =
        product.productVariants.map((variant) => {
          const optionValue: OptionValueResponseDto[] = [];

          variant.optionValueVariants.map((item) =>
            optionValue.push({
              option: item.optionValue.option.name,
              value: item.optionValue.value,
            }),
          );

          return {
            id: variant.id,
            image: variant.image,
            quantity: variant.quantity,
            optionValue: optionValue,
            price: variant.price,
          };
        });

      // get option values
      const optionValues: OptionValuesResponseDto[] = [];

      product.productVariants.map((variant) =>
        variant.optionValueVariants.map((item) => {
          const existedOptionIndex = optionValues.findIndex(
            (optionValue) =>
              optionValue.option === item.optionValue.option.name,
          );
          if (existedOptionIndex === -1) {
            optionValues.push({
              option: item.optionValue.option.name,
              values: [item.optionValue.value],
            });
          } else {
            const existedValueIndex = optionValues[
              existedOptionIndex
            ].values.findIndex((value) => value === item.optionValue.value);
            if (existedValueIndex === -1) {
              optionValues[existedOptionIndex].values.push(
                item.optionValue.value,
              );
            }
          }
        }),
      );

      // get summary
      const [numberOfReviews, averageRating, numberOfPurchases] =
        await this.getSummary(slug);

      // response
      const response: BaseProductResponseDto = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        categories: product.baseProductCategories.map(
          (baseProductCategory) => baseProductCategory.category,
        ),
        brand: product.brand,
        status: product.status,
        averageRating: averageRating,
        numberOfPurchases: numberOfPurchases,
        numberOfReviews: numberOfReviews,
        images: product.images,
        optionValues: optionValues,
        relatedProducts: relatedProducts,
        productVariants: productVariants,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateQuantity(
    productVariantId: number,
    quantity: number,
    type: UpdateQuantityType,
  ) {
    try {
      await this.prisma.productVariant.update({
        where: { id: productVariantId },
        data: {
          quantity:
            type === UpdateQuantityType.DECREMENT
              ? {
                  decrement: quantity,
                }
              : { increment: quantity },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getBaseProducts(
    whereClause: any,
    limit: number,
    page: number,
    sortBy: string,
  ): Promise<ProductVariantResponseDto[]> {
    const baseProducts = await this.prisma.baseProduct.findMany({
      where: {
        status: BaseProductStatus.ACTIVE,
        ...whereClause,
      },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        slug: true,
        name: true,
        productVariants: {
          take: 1,
          select: {
            id: true,
            image: true,
            price: true,
          },
        },
      },
    });

    const baseProductSummaryQueries = baseProducts.map((baseProduct) =>
      this.getSummary(baseProduct.slug),
    );
    const baseProductSummaries = await Promise.all(baseProductSummaryQueries);

    const response: ProductVariantResponseDto[] = baseProducts
      .map((baseProduct, index) => {
        const [numberOfReviews, averageRating, numberOfPurchases] =
          baseProductSummaries[index];
        const productVariant = baseProduct.productVariants[0];

        if (productVariant) {
          return {
            id: baseProduct.id,
            image: productVariant.image,
            name: baseProduct.name,
            price: productVariant.price,
            slug: baseProduct.slug,
            variantId: productVariant.id,
            averageRating: averageRating,
            numberOfReviews: numberOfReviews,
            numberOfPurchases: numberOfPurchases,
          };
        }
      })
      .filter(Boolean) as ProductVariantResponseDto[];

    // Sort the response based on sortBy criteria
    switch (sortBy) {
      case OrderBySearchParams.PRICE_ASC:
        response.sort((a, b) => a.price - b.price);
        break;
      case OrderBySearchParams.PRICE_DESC:
        response.sort((a, b) => b.price - a.price);
        break;
      case OrderBySearchParams.BEST_SELLING:
        response.sort((a, b) => b.numberOfPurchases - a.numberOfPurchases);
        break;
      default:
        response.sort((a, b) => b.numberOfPurchases - a.numberOfPurchases);
        break;
    }

    return response;
  }

  async getProductsByCategorySlug(
    slug: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = 'bestSelling',
    page: number = 1,
    limit: number = 20,
  ): Promise<ProductVariantResponseDto[]> {
    const whereClause = {
      baseProductCategories: {
        some: {
          category: {
            slug: slug,
          },
        },
      },
    };

    if (!Number.isNaN(fromPrice) && !Number.isNaN(toPrice)) {
      whereClause['productVariants'] = {
        some: {
          price: {
            gte: fromPrice,
            lte: toPrice,
          },
        },
      };
    }

    return this.getBaseProducts(whereClause, limit, page, sortBy);
  }

  async getProductsByBrandSlug(
    slug: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = 'bestSelling',
    page: number = 1,
    limit: number = 20,
  ): Promise<ProductVariantResponseDto[]> {
    const whereClause = {
      brand: {
        slug: slug,
      },
    };

    if (!Number.isNaN(fromPrice) && !Number.isNaN(toPrice)) {
      whereClause['productVariants'] = {
        some: {
          price: {
            gte: fromPrice,
            lte: toPrice,
          },
        },
      };
    }

    return this.getBaseProducts(whereClause, limit, page, sortBy);
  }

  async searchProductByName(
    name: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = OrderBySearchParams.BEST_SELLING,
    page: number = 1,
    limit: number = 20,
  ): Promise<ProductVariantResponseDto[]> {
    const whereClause: any = {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    };

    if (!Number.isNaN(fromPrice) && !Number.isNaN(toPrice)) {
      whereClause.productVariants = {
        some: {
          price: {
            gte: fromPrice,
            lte: toPrice,
          },
        },
      };
    }

    return this.getBaseProducts(whereClause, limit, page, sortBy);
  }
}
