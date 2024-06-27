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

  // async getAllBaseProduct(): Promise<BasicBaseProductResponseDto[]> {
  //   try {
  //     const baseProducts = await this.prisma.baseProduct.findMany({
  //       include: {
  //         baseProductCategories: {
  //           select: {
  //             category: {
  //               select: {
  //                 name: true,
  //               },
  //             },
  //           },
  //         },
  //         images: {
  //           where: { isDefault: true },
  //           select: {
  //             path: true,
  //           },
  //         },
  //       },
  //     });

  //     const responses: BasicBaseProductResponseDto[] = baseProducts.map(
  //       (item) => {
  //         const categories: string[] = item.baseProductCategories.map(
  //           (baseProductCategory) => baseProductCategory.category.name,
  //         );

  //         return {
  //           id: item.id,
  //           slug: item.slug,
  //           name: item.name,
  //           description: item.description,
  //           categories: categories,
  //           status: item.status,
  //           image: item.images[0].path,
  //         };
  //       },
  //     );
  //     return responses;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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

  // async getBySlug(slug: string) {
  //   try {
  //     // query by slug
  //     const product = await this.prisma.baseProduct.findUnique({
  //       where: { Slug: slug },
  //       include: {
  //         category: {
  //           select: {
  //             Slug: true,
  //           },
  //         },
  //         images: {
  //           select: {
  //             Id: true,
  //             Path: true,
  //             IsDefault: true,
  //           },
  //         },
  //         productVariants: {
  //           select: {
  //             Id: true,
  //             Image: true,
  //             Quantity: true,
  //             feedbacks: {
  //               select: {
  //                 Rating: true,
  //               },
  //             },
  //             orderDetails: {
  //               select: {
  //                 Quantity: true,
  //                 order: {
  //                   select: { Status: true },
  //                 },
  //               },
  //             },
  //             optionValueVariants: {
  //               select: {
  //                 optionValue: {
  //                   select: {
  //                     option: {
  //                       select: {
  //                         Name: true,
  //                       },
  //                     },
  //                     Value: true,
  //                   },
  //                 },
  //                 OptionValueId: true,
  //               },
  //             },
  //             prices: {
  //               orderBy: {
  //                 UpdatedAt: 'desc',
  //               },
  //               take: 1,
  //               select: {
  //                 Price: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     // get relate products by getting products from base product category, limit is 5 items
  //     const variantsInCategory = await this.categoryService.getBySlug(
  //       product.category.Slug,
  //       5,
  //     );

  //     // get product variants from base product
  //     const productVariants: ProductVariantDto[] = product.productVariants.map(
  //       (variant) => {
  //         const optionValue: OptionValueResponseDto[] = [];

  //         variant.optionValueVariants.map((item) =>
  //           optionValue.push({
  //             option: item.optionValue.option.Name,
  //             value: item.optionValue.Value,
  //           }),
  //         );

  //         return {
  //           id: variant.Id,
  //           image: variant.Image,
  //           quantity: variant.Quantity,
  //           optionValue: optionValue,
  //           price: variant.prices[0].Price,
  //         };
  //       },
  //     );

  //     const optionValues: OptionValuesResponseDto[] = [];

  //     product.productVariants.map((variant) =>
  //       variant.optionValueVariants.map((item) => {
  //         const existedOptionIndex = optionValues.findIndex(
  //           (optionValue) =>
  //             optionValue.option === item.optionValue.option.Name,
  //         );
  //         if (existedOptionIndex === -1) {
  //           optionValues.push({
  //             option: item.optionValue.option.Name,
  //             values: [item.optionValue.Value],
  //           });
  //         } else {
  //           const existedValueIndex = optionValues[
  //             existedOptionIndex
  //           ].values.findIndex((value) => value === item.optionValue.Value);
  //           if (existedValueIndex === -1) {
  //             optionValues[existedOptionIndex].values.push(
  //               item.optionValue.Value,
  //             );
  //           }
  //         }
  //       }),
  //     );

  //     // get average rating and number of feedbacks
  //     let numberOfFeedbacks = 0;

  //     const sumRating = product.productVariants.reduce((prev, variant) => {
  //       const sum = variant.feedbacks.reduce((previousValue, feedback) => {
  //         numberOfFeedbacks += 1;
  //         return previousValue + feedback.Rating;
  //       }, 0);

  //       const average = (sum / variant.feedbacks.length) | 0;
  //       return prev + average;
  //     }, 0);

  //     const averageRating = (sumRating / product.productVariants.length) | 0;

  //     // get number of purchases
  //     const numberOfPurchases = product.productVariants.reduce(
  //       (prev, variant) => {
  //         const sum = variant.orderDetails.reduce(
  //           (previousValue, orderDetail) => {
  //             if (orderDetail.order.Status !== OrderStatus.SUCCESS) {
  //               return previousValue;
  //             }
  //             return previousValue + orderDetail.Quantity;
  //           },
  //           0,
  //         );
  //         return prev + sum;
  //       },
  //       0,
  //     );

  //     const response: BaseProductResponseDto = {
  //       id: product.Id,
  //       slug: product.Slug,
  //       name: product.Name,
  //       description: product.Description,
  //       categoryId: product.CategoryId,
  //       status: product.Status,
  //       averageRating: averageRating,
  //       numberOfPurchases: numberOfPurchases,
  //       numberOfFeedbacks: numberOfFeedbacks,
  //       images: product.images,
  //       optionValues: optionValues,
  //       relatedProducts: variantsInCategory.products,
  //       productVariants: productVariants,
  //     };

  //     return response;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async updateQuantity(
  //   productVariantId: number,
  //   quantity: number,
  //   type: UpdateQuantityType,
  // ) {
  //   try {
  //     switch (type) {
  //       case UpdateQuantityType.decrement: {
  //         await this.prisma.productVariant.update({
  //           where: { Id: productVariantId },
  //           data: {
  //             Quantity: {
  //               decrement: quantity,
  //             },
  //           },
  //         });
  //         break;
  //       }
  //       case UpdateQuantityType.increment: {
  //         await this.prisma.productVariant.update({
  //           where: { Id: productVariantId },
  //           data: {
  //             Quantity: {
  //               increment: quantity,
  //             },
  //           },
  //         });
  //         break;
  //       }
  //       default:
  //         break;
  //     }
  //   } catch (error) {}
  // }

  // async getBaseProductsByCategorySlug(slug: string) {
  //   try {
  //     const baseProducts = await this.prisma.baseProduct.findMany({
  //       where: slug === '_' ? {} : { category: { Slug: slug } },
  //       include: {
  //         category: {
  //           select: {
  //             Name: true,
  //           },
  //         },
  //         images: {
  //           where: { IsDefault: true },
  //           select: {
  //             Path: true,
  //           },
  //         },
  //       },
  //     });
  //     const responses = baseProducts.map((item) => ({
  //       Id: item.Id,
  //       Slug: item.Slug,
  //       Name: item.Name,
  //       Description: item.Description,
  //       CategoryId: item.category.Name,
  //       Status: item.Status,
  //       image: item.images[0].Path,
  //     }));
  //     return responses;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
