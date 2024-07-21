import { Injectable } from '@nestjs/common';
import { OptionValueService } from 'src/option-value/option-value.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OptionValueResponseDto, ProductVariantResponseDto } from './dto';
import {
  CreateProductVariantRequestDto,
  UpdateVariantRequestDto,
} from './dto/request.dto';

@Injectable()
export class ProductVariantService {
  constructor(private prisma: PrismaService) {}

  async createProductVariant(
    createProductVariantRequestDto: CreateProductVariantRequestDto,
  ): Promise<ProductVariantResponseDto> {
    try {
      const response = await this.prisma.$transaction(async (prisma) => {
        const productVariant = await prisma.productVariant.create({
          data: {
            baseProductId: createProductVariantRequestDto.baseProductId,
            image: createProductVariantRequestDto.image,
            quantity: createProductVariantRequestDto.quantity,
            price: createProductVariantRequestDto.price,
          },
          select: {
            id: true,
            image: true,
            quantity: true,
            price: true,
          },
        });

        const optionValueVariantPromises =
          createProductVariantRequestDto.optionValueIds.map((optionValueId) =>
            prisma.optionValueVariant.create({
              data: {
                optionValueId: optionValueId,
                productVariantId: productVariant.id,
              },
              select: {
                optionValue: {
                  select: {
                    value: true,
                    option: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            }),
          );

        const optionValueVariants = await Promise.all(
          optionValueVariantPromises,
        );
        const optionValue: OptionValueResponseDto[] = optionValueVariants.map(
          (optionValueVariant) => {
            return {
              option: optionValueVariant.optionValue.option.name,
              value: optionValueVariant.optionValue.value,
            };
          },
        );
        const response: ProductVariantResponseDto = {
          ...productVariant,
          optionValue,
        };

        return response;
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateVariant(updateVariantRequestDto: UpdateVariantRequestDto) {
    try {
      const response = await this.prisma.$transaction(async (prisma) => {
        const productVariant = await prisma.productVariant.update({
          where: {
            id: updateVariantRequestDto.productVariantId,
          },
          data: {
            image: updateVariantRequestDto.image,
            quantity: updateVariantRequestDto.quantity,
          },
          select: {
            id: true,
            image: true,
            quantity: true,
            price: true,
            optionValueVariants: {
              select: {
                optionValue: {
                  select: {
                    value: true,
                    option: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        let price = { price: productVariant.price };
        if (price.price !== updateVariantRequestDto.price) {
          price = await prisma.productVariant.update({
            where: {
              id: updateVariantRequestDto.productVariantId,
            },
            data: {
              price: updateVariantRequestDto.price,
            },
            select: {
              price: true,
            },
          });
        }

        const optionValue: OptionValueResponseDto[] =
          productVariant.optionValueVariants.map((optionValueVariant) => {
            return {
              option: optionValueVariant.optionValue.option.name,
              value: optionValueVariant.optionValue.value,
            };
          });
        const response: ProductVariantResponseDto = {
          ...productVariant,
          optionValue,
          price: price.price,
        };

        return response;
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}
