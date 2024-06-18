import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddBaseProductDto,
  AddProductOptionDto,
  CreateProductDto,
} from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';
import { BaseProductStatus } from 'src/constants/enum/base-product-status.enum';
import { OptionValue } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // async getProductOptionsByCategoryId(
  //   categoryId: string,
  // ) {
  //   try {
  //     const categoryIdNum =
  //       Number.parseInt(categoryId);

  //     const category =
  //       await this.prisma.category.findUnique({
  //         where: {
  //           Id: categoryIdNum,
  //         },
  //       });

  //     if (!category) {
  //       throw new NotFoundException(
  //         'Category not found.',
  //       );
  //     }

  //     const options = category.ProductOptions;
  //     return options;
  //   } catch (error) {
  //     if (error.status === 404) {
  //       throw new NotFoundException(
  //         'Category not found.',
  //       );
  //     } else {
  //       throw new BadRequestException(
  //         'Category id must be a number.',
  //       );
  //     }
  //   }
  // }

  // async addProductOption(
  //   addProductOptionDto: AddProductOptionDto,
  // ) {
  //   try {
  //     const options =
  //       await this.getProductOptionsByCategoryId(
  //         addProductOptionDto.categoryId.toString(),
  //       );

  //     const existedOptionIndex =
  //       options.findIndex(
  //         (option) =>
  //           option.Name ===
  //           addProductOptionDto.name,
  //       );

  //     if (existedOptionIndex !== -1) {
  //       throw new ConflictException(
  //         'Option already exists.',
  //       );
  //     }

  //     const productOption =
  //       await this.prisma.productOption.create({
  //         data: {
  //           CategoryId:
  //             addProductOptionDto.categoryId,
  //           Name: addProductOptionDto.name,
  //         },
  //       });

  //     return productOption;
  //   } catch (error) {
  //     if (error.status === 409) {
  //       throw new ConflictException(
  //         'Option already exists.',
  //       );
  //     } else if (error.status === 404) {
  //       throw new NotFoundException(
  //         'Category not found.',
  //       );
  //     }
  //   }
  // }

  async getAllBaseProduct() {
    try {
      const baseProducts =
        await this.prisma.baseProduct.findMany();
      return baseProducts;
    } catch (error) {
      throw new BadRequestException(error);
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
      throw new BadRequestException(error);
    }
  }

  async createOption(name: string) {
    const existedOption =
      await this.prisma.option.findUnique({
        where: { Name: name },
      });

    if (existedOption) {
      return existedOption;
    }

    const newOption =
      await this.prisma.option.create({
        data: {
          Name: name,
        },
      });

    return newOption;
  }

  async createOptionValue(
    optionName: string,
    value: string,
  ) {
    const option =
      await this.prisma.option.findUnique({
        where: { Name: optionName },
        include: { optionValues: true },
      });

    const existedOptionValue =
      option.optionValues.find(
        (item) => item.Value === value,
      );

    if (existedOptionValue) {
      return existedOptionValue;
    }

    const newOptionValue =
      await this.prisma.optionValue.create({
        data: {
          OptionId: option.Id,
          Value: value,
        },
      });

    return newOptionValue;
  }

  async savePrice(
    productVariantId: number,
    updatedAt: Date,
    price: number,
  ) {
    const newPrice =
      await this.prisma.price.create({
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
    const optionValueVariant =
      await this.prisma.optionValueVariant.create(
        {
          data: {
            OptionValueId: optionValueId,
            ProductVariantId: productVariantId,
          },
        },
      );
    return optionValueVariant;
  }

  async createProductVariant(
    baseProductId: number,
    image: string,
    quantity: number,
    price: number,
    optionValueIds: number[],
  ) {
    const productVariant =
      await this.prisma.productVariant.create({
        data: {
          BaseProductId: baseProductId,
          Image: image,
          Quantity: quantity,
        },
      });
    const newPrice = await this.savePrice(
      productVariant.Id,
      new Date(),
      price,
    );

    const optionValueVariantPromises =
      optionValueIds.map((item) =>
        this.createOptionValueVariant(
          item,
          productVariant.Id,
        ),
      );
    const optionValueVariants = await Promise.all(
      optionValueVariantPromises,
    );
    return {
      productVariant,
      price: newPrice,
      optionValueVariants,
    };
  }

  async createBaseProduct(
    createProductDto: CreateProductDto,
  ) {
    try {
      // save base product
      const baseProduct =
        await this.prisma.baseProduct.create({
          data: {
            Name: createProductDto.name,
            Slug: normalizeName(
              createProductDto.name,
            ),
            Description:
              createProductDto.description,
            Status: BaseProductStatus.ACTIVE,
            CategoryId:
              createProductDto.categoryId,
          },
        });

      // save all images from base product
      const imagePromises =
        createProductDto.images.map(
          (item, index) =>
            this.addBaseProductImage(
              baseProduct.Id,
              item,
              index === 0,
            ),
        );
      const productBaseImages = await Promise.all(
        imagePromises,
      );

      // save all options (if not existed)
      const optionPromises =
        createProductDto.options.map((item) =>
          this.createOption(item.name),
        );
      const options = await Promise.all(
        optionPromises,
      );

      // save all values (if not existed)
      let valuePromises: Promise<OptionValue>[] =
        [];

      createProductDto.options.map((item) => {
        valuePromises.push(
          ...item.values.map((value) =>
            this.createOptionValue(
              item.name,
              value,
            ),
          ),
        );
      });
      const optionValues = await Promise.all(
        valuePromises,
      );

      // save all product variant
      const productVariantPromises =
        createProductDto.variants.map((item) => {
          const optionValueIds =
            item.optionValues.map(
              (optionValue) => {
                const myOption = options.find(
                  (option) =>
                    option.Name ===
                    optionValue.option,
                );
                const myOptionValue =
                  optionValues.find(
                    (opVal) =>
                      opVal.OptionId ===
                        myOption.Id &&
                      opVal.Value ===
                        optionValue.value,
                  );
                return myOptionValue.Id;
              },
            );
          return this.createProductVariant(
            baseProduct.Id,
            item.image,
            item.quantity,
            item.price,
            optionValueIds,
          );
        });
      const productVariants = await Promise.all(
        productVariantPromises,
      );

      return {
        ...baseProduct,
        images: productBaseImages,
        options,
        optionValues,
        productVariants,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Product name must be unique',
        );
      } else {
        throw new BadRequestException(error);
      }
    }
  }
}
