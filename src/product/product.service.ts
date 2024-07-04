import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseProductCategoryResponseDto,
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
import { OptionValue } from '@prisma/client';
import { CategoryService } from 'src/category/category.service';
import { OrderStatus } from 'src/constants/enum';
import { UpdateQuantityType } from 'src/constants/enum/update-quantiy-type.enum';
import { ImageService } from 'src/image/image.service';
import { OptionValueService } from 'src/option-value/option-value.service';
import { ProductVariantService } from 'src/product-variant/product-variant.service';
import { BrandService } from 'src/brand/brand.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private categoryService: CategoryService,
    private imageService: ImageService,
    private optionValueService: OptionValueService,
    private productVariantService: ProductVariantService,
    private brandService: BrandService,
  ) {}

  async getAllBaseProduct(): Promise<BasicBaseProductResponseDto[]> {
    try {
      const baseProducts = await this.prisma.baseProduct.findMany({
        include: {
          brand: true,
          baseProductCategories: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          images: {
            where: { isDefault: true },
            select: {
              path: true,
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
            description: item.description,
            categories: categories,
            brand: item.brand.name,
            status: item.status,
            image: item.images[0].path,
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
          description: baseProduct.description,
          status: baseProduct.status,
          categories: baseProductCategories.map(
            (baseProductCategory) => baseProductCategory.category.name,
          ),
          brand: baseProduct.brand.name,
          image: baseProductImages[0].path,
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
              orderDetails: {
                select: {
                  quantity: true,
                  order: {
                    select: {
                      status: true,
                    },
                  },
                  review: {
                    select: {
                      rating: true,
                    },
                  },
                },
              },
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

      // number of reviews in this base product
      let numberOfReviews = 0;

      // summary rating of this base product
      const sumRating = product.productVariants.reduce((prev, variant) => {
        // number of review of this variant
        let len = 0;

        // get summary rating of this variant
        const sum = variant.orderDetails.reduce(
          (previousValue, orderDetail) => {
            if (orderDetail.review) {
              len += 1;
              numberOfReviews += 1;
              return previousValue + orderDetail.review.rating;
            }
            return previousValue;
          },
          0,
        );

        return prev + sum;
      }, 0);

      // average rating of this base product
      const averageRating = Math.round(sumRating / numberOfReviews) | 0;

      // get number of purchases
      const numberOfPurchases = product.productVariants.reduce(
        (prev, variant) => {
          const sum = variant.orderDetails.reduce(
            (previousValue, orderDetail) => {
              if (orderDetail.order.status !== OrderStatus.SUCCESS) {
                return previousValue;
              }
              return previousValue + orderDetail.quantity;
            },
            0,
          );
          return prev + sum;
        },
        0,
      );

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
                  productVariants: {
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
                      orderDetails: {
                        select: {
                          quantity: true,
                          order: {
                            select: {
                              status: true,
                            },
                          },
                          review: {
                            select: {
                              rating: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const productVariants: ProductVariantResponseDto[] = [];

      category.baseProductCategories.map((baseProductCategory) =>
        baseProductCategory.baseProduct.productVariants.map(
          (productVariant) => {
            // number of reviews in this base product
            let numberOfReviews = 0;

            // summary rating of this base product
            const sumRating =
              baseProductCategory.baseProduct.productVariants.reduce(
                (prev, variant) => {
                  // number of review of this variant
                  let len = 0;

                  // get summary rating of this variant
                  const sum = variant.orderDetails.reduce(
                    (previousValue, orderDetail) => {
                      if (orderDetail.review) {
                        len += 1;
                        numberOfReviews += 1;
                        return previousValue + orderDetail.review.rating;
                      }
                      return previousValue;
                    },
                    0,
                  );

                  return prev + sum;
                },
                0,
              );

            // average rating of this base product
            const averageRating = Math.round(sumRating / numberOfReviews) | 0;

            // get number of purchases
            const numberOfPurchases =
              baseProductCategory.baseProduct.productVariants.reduce(
                (prev, variant) => {
                  const sum = variant.orderDetails.reduce(
                    (previousValue, orderDetail) => {
                      if (orderDetail.order.status !== OrderStatus.SUCCESS) {
                        return previousValue;
                      }
                      return previousValue + orderDetail.quantity;
                    },
                    0,
                  );
                  return prev + sum;
                },
                0,
              );

            productVariants.push({
              id: baseProductCategory.baseProduct.id,
              image: productVariant.image,
              name: baseProductCategory.baseProduct.name,
              price: productVariant.prices[0].price,
              slug: baseProductCategory.baseProduct.slug,
              variantId: productVariant.id,
              averageRating: averageRating,
              numberOfReviews: numberOfReviews,
              numberOfPurchases: numberOfPurchases,
            });
          },
        ),
      );
      return productVariants;
    } catch (error) {
      throw error;
    }
  }
}
