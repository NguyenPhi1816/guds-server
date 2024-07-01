import { Injectable } from '@nestjs/common';
import { OptionValueService } from 'src/option-value/option-value.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OptionValueResponseDto, ProductVariantResponseDto } from './dto';
import {
  CreateProductVariantRequestDto,
  UpdatePriceRequestDto,
  UpdateQuantityRequestDto,
} from './dto/request.dto';
import { UpdateQuantityType } from 'src/constants/enum/update-quantiy-type.enum';

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
          },
          select: {
            id: true,
            image: true,
            quantity: true,
          },
        });

        const price = await prisma.price.create({
          data: {
            price: createProductVariantRequestDto.price,
            updatedAt: new Date(),
            productVariantId: productVariant.id,
          },
          select: {
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
          price: price.price,
        };

        return response;
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updatePrice(updatePriceRequestDto: UpdatePriceRequestDto) {
    try {
      const price = await this.prisma.price.create({
        data: {
          price: updatePriceRequestDto.price,
          productVariantId: updatePriceRequestDto.productVariantId,
          updatedAt: new Date(),
        },
      });
      return price;
    } catch (error) {
      throw error;
    }
  }

  async updateQuantity(updateQuantityRequestDto: UpdateQuantityRequestDto) {
    try {
      const productVariant = await this.prisma.productVariant.update({
        where: { id: updateQuantityRequestDto.productVariantId },
        data: {
          quantity:
            updateQuantityRequestDto.type === UpdateQuantityType.INCREMENT
              ? {
                  increment: updateQuantityRequestDto.quantity,
                }
              : { decrement: updateQuantityRequestDto.quantity },
        },
      });
      return productVariant;
    } catch (error) {
      throw error;
    }
  }
}
