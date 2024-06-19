import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseProductResponseDto,
  CreateProductDto,
  OptionValueResponseDto,
  OptionValuesResponseDto,
  ProductVariantDto,
} from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import { BaseProductStatus } from 'src/constants/enum/base-product-status.enum';
import { OptionValue } from '@prisma/client';
import { CategoryService } from 'src/category/category.service';
import { OrderStatus } from 'src/constants/enum';
import { UpdateQuantityType } from 'src/constants/enum/update-quantiy-type.enum';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private categoryService: CategoryService,
  ) {}

  async getAllBaseProduct() {
    try {
      const baseProducts = await this.prisma.baseProduct.findMany();
      return baseProducts;
    } catch (error) {
      throw error;
    }
  }

  async addBaseProductImage(
    baseProductId: number,
    path: string,
    isDefault: boolean,
  ) {
    try {
      return this.prisma.baseProductImage.create({
        data: {
          BaseProductId: baseProductId,
          Path: path,
          IsDefault: isDefault,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createOption(name: string) {
    const existedOption = await this.prisma.option.findUnique({
      where: { Name: name },
    });

    if (existedOption) {
      return existedOption;
    }

    const newOption = await this.prisma.option.create({
      data: {
        Name: name,
      },
    });

    return newOption;
  }

  async createOptionValue(optionName: string, value: string) {
    const option = await this.prisma.option.findUnique({
      where: { Name: optionName },
      include: { optionValues: true },
    });

    const existedOptionValue = option.optionValues.find(
      (item) => item.Value === value,
    );

    if (existedOptionValue) {
      return existedOptionValue;
    }

    const newOptionValue = await this.prisma.optionValue.create({
      data: {
        OptionId: option.Id,
        Value: value,
      },
    });

    return newOptionValue;
  }

  async savePrice(productVariantId: number, updatedAt: Date, price: number) {
    const newPrice = await this.prisma.price.create({
      data: {
        Price: price,
        UpdatedAt: updatedAt,
        ProductVariantId: productVariantId,
      },
    });
    return newPrice;
  }

  async createOptionValueVariant(
    optionValueId: number,
    productVariantId: number,
  ) {
    const optionValueVariant = await this.prisma.optionValueVariant.create({
      data: {
        OptionValueId: optionValueId,
        ProductVariantId: productVariantId,
      },
    });
    return optionValueVariant;
  }

  async createProductVariant(
    baseProductId: number,
    image: string,
    quantity: number,
    price: number,
    optionValueIds: number[],
  ) {
    const productVariant = await this.prisma.productVariant.create({
      data: {
        BaseProductId: baseProductId,
        Image: image,
        Quantity: quantity,
      },
    });
    const newPrice = await this.savePrice(productVariant.Id, new Date(), price);

    const optionValueVariantPromises = optionValueIds.map((item) =>
      this.createOptionValueVariant(item, productVariant.Id),
    );
    const optionValueVariants = await Promise.all(optionValueVariantPromises);
    return {
      productVariant,
      price: newPrice,
      optionValueVariants,
    };
  }

  async createBaseProduct(createProductDto: CreateProductDto) {
    try {
      // save base product
      const baseProduct = await this.prisma.baseProduct.create({
        data: {
          Name: createProductDto.name,
          Slug: normalizeName(createProductDto.name),
          Description: createProductDto.description,
          Status: BaseProductStatus.ACTIVE,
          CategoryId: createProductDto.categoryId,
        },
      });

      // save all images from base product
      const imagePromises = createProductDto.images.map((item, index) =>
        this.addBaseProductImage(baseProduct.Id, item, index === 0),
      );
      const productBaseImages = await Promise.all(imagePromises);

      // save all options (if not existed)
      const optionPromises = createProductDto.options.map((item) =>
        this.createOption(item.name),
      );
      const options = await Promise.all(optionPromises);

      // save all values (if not existed)
      let valuePromises: Promise<OptionValue>[] = [];

      createProductDto.options.map((item) => {
        valuePromises.push(
          ...item.values.map((value) =>
            this.createOptionValue(item.name, value),
          ),
        );
      });
      const optionValues = await Promise.all(valuePromises);

      // save all product variant
      const productVariantPromises = createProductDto.variants.map((item) => {
        const optionValueIds = item.optionValues.map((optionValue) => {
          const myOption = options.find(
            (option) => option.Name === optionValue.option,
          );
          const myOptionValue = optionValues.find(
            (opVal) =>
              opVal.OptionId === myOption.Id &&
              opVal.Value === optionValue.value,
          );
          return myOptionValue.Id;
        });
        return this.createProductVariant(
          baseProduct.Id,
          item.image,
          item.quantity,
          item.price,
          optionValueIds,
        );
      });
      const productVariants = await Promise.all(productVariantPromises);

      return {
        ...baseProduct,
        images: productBaseImages,
        options,
        optionValues,
        productVariants,
      };
    } catch (error) {
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
        where: { Slug: slug },
        include: {
          category: {
            select: {
              Slug: true,
            },
          },
          images: {
            select: {
              Id: true,
              Path: true,
              IsDefault: true,
            },
          },
          productVariants: {
            select: {
              Id: true,
              Image: true,
              Quantity: true,
              feedbacks: {
                select: {
                  Rating: true,
                },
              },
              orderDetails: {
                select: {
                  Quantity: true,
                  order: {
                    select: { Status: true },
                  },
                },
              },
              optionValueVariants: {
                select: {
                  optionValue: {
                    select: {
                      option: {
                        select: {
                          Name: true,
                        },
                      },
                      Value: true,
                    },
                  },
                  OptionValueId: true,
                },
              },
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
      });

      // get relate products by getting products from base product category, limit is 5 items
      const variantsInCategory = await this.categoryService.getBySlug(
        product.category.Slug,
        5,
      );

      // get product variants from base product
      const productVariants: ProductVariantDto[] = product.productVariants.map(
        (variant) => {
          const optionValue: OptionValueResponseDto[] = [];

          variant.optionValueVariants.map((item) =>
            optionValue.push({
              option: item.optionValue.option.Name,
              value: item.optionValue.Value,
            }),
          );

          return {
            id: variant.Id,
            image: variant.Image,
            quantity: variant.Quantity,
            optionValue: optionValue,
            price: variant.prices[0].Price,
          };
        },
      );

      const optionValues: OptionValuesResponseDto[] = [];

      product.productVariants.map((variant) =>
        variant.optionValueVariants.map((item) => {
          const existedOptionIndex = optionValues.findIndex(
            (optionValue) =>
              optionValue.option === item.optionValue.option.Name,
          );
          if (existedOptionIndex === -1) {
            optionValues.push({
              option: item.optionValue.option.Name,
              values: [item.optionValue.Value],
            });
          } else {
            const existedValueIndex = optionValues[
              existedOptionIndex
            ].values.findIndex((value) => value === item.optionValue.Value);
            if (existedValueIndex === -1) {
              optionValues[existedOptionIndex].values.push(
                item.optionValue.Value,
              );
            }
          }
        }),
      );

      // get average rating and number of feedbacks
      let numberOfFeedbacks = 0;

      const sumRating = product.productVariants.reduce((prev, variant) => {
        const sum = variant.feedbacks.reduce((previousValue, feedback) => {
          numberOfFeedbacks += 1;
          return previousValue + feedback.Rating;
        }, 0);

        const average = (sum / variant.feedbacks.length) | 0;
        return prev + average;
      }, 0);

      const averageRating = (sumRating / product.productVariants.length) | 0;

      // get number of purchases
      const numberOfPurchases = product.productVariants.reduce(
        (prev, variant) => {
          const sum = variant.orderDetails.reduce(
            (previousValue, orderDetail) => {
              if (orderDetail.order.Status !== OrderStatus.SUCCESS) {
                return previousValue;
              }
              return previousValue + orderDetail.Quantity;
            },
            0,
          );
          return prev + sum;
        },
        0,
      );

      const response: BaseProductResponseDto = {
        id: product.Id,
        slug: product.Slug,
        name: product.Name,
        description: product.Description,
        categoryId: product.CategoryId,
        status: product.Status,
        averageRating: averageRating,
        numberOfPurchases: numberOfPurchases,
        numberOfFeedbacks: numberOfFeedbacks,
        images: product.images,
        optionValues: optionValues,
        relatedProducts: variantsInCategory.products,
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
      switch (type) {
        case UpdateQuantityType.decrement: {
          await this.prisma.productVariant.update({
            where: { Id: productVariantId },
            data: {
              Quantity: {
                decrement: quantity,
              },
            },
          });
          break;
        }
        case UpdateQuantityType.increment: {
          await this.prisma.productVariant.update({
            where: { Id: productVariantId },
            data: {
              Quantity: {
                increment: quantity,
              },
            },
          });
          break;
        }
        default:
          break;
      }
    } catch (error) {}
  }
}
