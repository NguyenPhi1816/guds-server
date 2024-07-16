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
} from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import { BaseProductStatus } from 'src/constants/enum/base-product-status.enum';
import { OrderStatus } from 'src/constants/enum';
import { UpdateQuantityType } from 'src/constants/enum/update-quantiy-type.enum';

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

  async getSummary(baseProductSlug: string) {
    try {
      const numberOfReviewsQuery = this.prisma.review.count({
        where: {
          orderDetail: {
            productVariant: { baseProduct: { slug: baseProductSlug } },
          },
        },
      });
      const averageRatingQuery = this.prisma.review.aggregate({
        where: {
          orderDetail: {
            productVariant: { baseProduct: { slug: baseProductSlug } },
          },
        },
        _avg: {
          rating: true,
        },
      });
      const orderDetailsQuery = this.prisma.orderDetail.findMany({
        where: {
          productVariant: { baseProduct: { slug: baseProductSlug } },
          order: {
            status: OrderStatus.SUCCESS,
          },
        },
        select: {
          quantity: true,
        },
      });

      const [numberOfReviews, averageRatingResult, orderDetails] =
        await Promise.all([
          numberOfReviewsQuery,
          averageRatingQuery,
          orderDetailsQuery,
        ]);

      const averageRating = Math.round(averageRatingResult._avg.rating);

      const numberOfPurchases = orderDetails.reduce(
        (prev, orderDetail) => prev + orderDetail.quantity,
        0,
      );
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
              prices: {
                orderBy: {
                  updatedAt: 'desc',
                },
                take: 1,
                select: {
                  price: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      // get relate products by getting products from base product category, limit is 5 items
      const relatedProducts = await this.getProductsByCategorySlug(
        product.baseProductCategories[0].category.slug,
        5,
      );

      console.log(product);

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
            price: variant.prices[0].price,
          };
        });

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

  async getProductsByCategorySlug(
    slug: string,
    limit: number = 20,
  ): Promise<ProductVariantResponseDto[]> {
    try {
      const baseProducts = await this.prisma.baseProduct.findMany({
        where: {
          baseProductCategories: {
            some: {
              category: {
                slug: slug,
              },
            },
          },
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          productVariants: {
            take: 1,
            select: {
              id: true,
              image: true,
              prices: {
                orderBy: {
                  updatedAt: 'desc',
                },
                take: 1,
                select: {
                  price: true,
                },
              },
            },
          },
        },
      });

      // get the summary of each product (number of reviews, average rating, number of purchases)
      const baseProductSummaryQueries = baseProducts.map((baseProduct) =>
        this.getSummary(baseProduct.slug),
      );
      const baseProductSummaries = await Promise.all(baseProductSummaryQueries);

      // prepare response
      const response: ProductVariantResponseDto[] = [];

      baseProducts.map((baseProduct, index) => {
        const [numberOfReviews, averageRating, numberOfPurchases] =
          baseProductSummaries[index];
        const productVariant = baseProduct.productVariants[0];

        if (productVariant) {
          response.push({
            id: baseProduct.id,
            image: productVariant.image,
            name: baseProduct.name,
            price: productVariant.prices[0].price,
            slug: baseProduct.slug,
            variantId: productVariant.id,
            averageRating: averageRating,
            numberOfReviews: numberOfReviews,
            numberOfPurchases: numberOfPurchases,
          });
        }
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getProductsByBrandSlug(slug: string, limit: number = 20) {
    const baseProducts = await this.prisma.baseProduct.findMany({
      where: {
        brand: { slug: slug },
      },
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        productVariants: {
          take: 1,
          select: {
            id: true,
            image: true,
            prices: {
              orderBy: {
                updatedAt: 'desc',
              },
              take: 1,
              select: {
                price: true,
              },
            },
          },
        },
      },
    });
    // get the summary of each product (number of reviews, average rating, number of purchases)
    const baseProductSummaryQueries = baseProducts.map((baseProduct) =>
      this.getSummary(baseProduct.slug),
    );
    const baseProductSummaries = await Promise.all(baseProductSummaryQueries);

    // prepare response
    const response: ProductVariantResponseDto[] = [];

    baseProducts.map((baseProduct, index) => {
      const [numberOfReviews, averageRating, numberOfPurchases] =
        baseProductSummaries[index];
      const productVariant = baseProduct.productVariants[0];

      if (productVariant) {
        response.push({
          id: baseProduct.id,
          image: productVariant.image,
          name: baseProduct.name,
          price: productVariant.prices[0].price,
          slug: baseProduct.slug,
          variantId: productVariant.id,
          averageRating: averageRating,
          numberOfReviews: numberOfReviews,
          numberOfPurchases: numberOfPurchases,
        });
      }
    });

    return response;
  }
}
