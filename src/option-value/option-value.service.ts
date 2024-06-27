import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateOptionValuesRequestDto,
  OptionValuesDto,
  OptionValuesResponseDto,
} from './dto';
import { OptionValue } from '@prisma/client';

@Injectable()
export class OptionValueService {
  constructor(private prisma: PrismaService) {}

  async createOptionValues(
    createOptionValuesRequestDto: CreateOptionValuesRequestDto,
  ): Promise<OptionValuesResponseDto[]> {
    try {
      // begin a transaction
      const newOptionValues = await this.prisma.$transaction(async (prisma) => {
        // save all options
        const options: string[] = createOptionValuesRequestDto.optionValues.map(
          (optionValue) => optionValue.option,
        );

        // check if options is exists

        const createOptionQueries = options.map((option) =>
          prisma.option.create({
            data: {
              baseProductId: createOptionValuesRequestDto.baseProductId,
              name: option,
            },
          }),
        );
        const savedOptions = await Promise.all(createOptionQueries);

        // save all option values
        const createOptionValuesQueries = [];
        savedOptions.map((savedOption) => {
          const optionValues: OptionValuesDto =
            createOptionValuesRequestDto.optionValues.find(
              (optionValue) => optionValue.option === savedOption.name,
            );
          optionValues.values.map((value) => {
            const createOptionValuesQuery = prisma.optionValue.create({
              data: { optionId: savedOption.id, value: value },
            });
            createOptionValuesQueries.push(createOptionValuesQuery);
          });
        });
        const savedOptionValues: OptionValue[] = await Promise.all(
          createOptionValuesQueries,
        );

        // prepare a response
        const response: OptionValuesResponseDto[] = savedOptions.map(
          (savedOption) => {
            const values: string[] = [];
            savedOptionValues.forEach((savedOptionValue) => {
              if (savedOptionValue.optionId === savedOption.id) {
                values.push(savedOptionValue.value);
              }
            });
            return {
              option: savedOption.name,
              values: values,
            };
          },
        );
        return response;
      });
      console.log(newOptionValues);

      return newOptionValues;
    } catch (error) {
      throw error;
    }
  }

  // async createOption(prisma: any, baseProductId: number, name: string) {
  //   try {
  //     const existedOption = await prisma.option.findFirst({
  //       where: { name: name, baseProductId: baseProductId },
  //     });

  //     if (existedOption) {
  //       return existedOption;
  //     }

  //     const newOption = await prisma.option.create({
  //       data: {
  //         name,
  //         baseProductId,
  //       },
  //     });

  //     return newOption;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async createOptionValues(prisma: any, optionId: number, value: string) {
  //   try {
  //     const optionValue = await prisma.optionValue.findFirst({
  //       where: { optionId: optionId, value: value },
  //       include: {
  //         option: true,
  //       },
  //     });

  //     if (optionValue) {
  //       return optionValue;
  //     }

  //     const newOptionValue = await prisma.optionValue.create({
  //       data: {
  //         optionId: optionId,
  //         value: value,
  //       },
  //       include: {
  //         option: true,
  //       },
  //     });

  //     return newOptionValue;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async createOptionValueVariant(
  //   prisma: any,
  //   optionValueId: number,
  //   productVariantId: number,
  // ) {
  //   try {
  //     const optionValueVariant = await prisma.optionValueVariant.create({
  //       data: {
  //         optionValueId: optionValueId,
  //         productVariantId: productVariantId,
  //       },
  //       select: {
  //         optionValue: {
  //           select: {
  //             option: {
  //               select: {
  //                 name: true,
  //               },
  //             },
  //             value: true,
  //           },
  //         },
  //       },
  //     });
  //     return optionValueVariant;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
