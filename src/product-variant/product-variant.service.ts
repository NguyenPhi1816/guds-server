import { Injectable } from '@nestjs/common';
import { OptionValueService } from 'src/option-value/option-value.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OptionValueResponseDto, ProductVariantResponseDto } from './dto';

@Injectable()
export class ProductVariantService {
  constructor(
    private prisma: PrismaService,
    private optionValueService: OptionValueService,
  ) {}

  // async saveProductVariantPrice(
  //   prisma: any,
  //   productVariantId: number,
  //   updatedAt: Date,
  //   price: number,
  // ) {
  //   try {
  //     const newPrice = await prisma.price.create({
  //       data: {
  //         price: price,
  //         updatedAt: updatedAt,
  //         productVariantId: productVariantId,
  //       },
  //       select: {
  //         price: true,
  //       },
  //     });
  //     return newPrice;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async createProductVariant(
  //   prisma: any,
  //   baseProductId: number,
  //   image: string,
  //   quantity: number,
  //   price: number,
  //   optionValueIds: number[],
  // ): Promise<ProductVariantResponseDto> {
  //   const productVariant = await prisma.productVariant.create({
  //     data: {
  //       baseProductId: baseProductId,
  //       image: image,
  //       quantity: quantity,
  //     },
  //     select: {
  //       id: true,
  //       image: true,
  //       quantity: true,
  //     },
  //   });
  //   const newPrice = await this.saveProductVariantPrice(
  //     prisma,
  //     productVariant.id,
  //     new Date(),
  //     price,
  //   );

  //   const optionValueVariantPromises = optionValueIds.map((item) =>
  //     this.optionValueService.createOptionValueVariant(
  //       prisma,
  //       item,
  //       productVariant.id,
  //     ),
  //   );

  //   const optionValueVariants = await Promise.all(optionValueVariantPromises);
  //   const optionValue: OptionValueResponseDto[] = optionValueVariants.map(
  //     (optionValueVariant) => {
  //       return {
  //         option: optionValueVariant.optionValue.option.name,
  //         value: optionValueVariant.optionValue.value,
  //       };
  //     },
  //   );

  //   return {
  //     ...productVariant,
  //     optionValue,
  //     price: newPrice.price,
  //   };
  // }
}
