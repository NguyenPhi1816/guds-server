import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddValuesToOptionRequestDto,
  CreateOptionValuesRequestDto,
  OptionValuesDto,
  OptionValuesResponseDto,
  UpdateOptionNameRequestDto,
  UpdateValueNameRequestDto,
  ValueResponseDto,
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
              data: {
                optionId: savedOption.id,
                value: value,
              },
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
            const values: ValueResponseDto[] = [];
            savedOptionValues.forEach((savedOptionValue) => {
              if (savedOptionValue.optionId === savedOption.id) {
                values.push({
                  valueId: savedOptionValue.id,
                  valueName: savedOptionValue.value,
                });
              }
            });
            return {
              optionId: savedOption.id,
              optionName: savedOption.name,
              values: values,
            };
          },
        );
        return response;
      });
      return newOptionValues;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Option already exists.');
      } else {
        throw error;
      }
    }
  }

  async addValuesToOption(
    addValuesToOptionRequestDto: AddValuesToOptionRequestDto,
  ) {
    try {
      // begin a transaction
      const myRes = await this.prisma.$transaction(async (prisma) => {
        const option = await prisma.option.findUnique({
          where: {
            id: addValuesToOptionRequestDto.optionId,
          },
        });
        if (option) {
          // add values to option
          const createOptionValueQueries =
            addValuesToOptionRequestDto.values.map((value) =>
              prisma.optionValue.create({
                data: {
                  optionId: option.id,
                  value: value,
                },
              }),
            );
          const newOptionValues = await Promise.all(createOptionValueQueries);

          const values: ValueResponseDto[] = newOptionValues.map(
            (optionValue) => ({
              valueId: optionValue.id,
              valueName: optionValue.value,
            }),
          );

          const response: OptionValuesResponseDto = {
            optionId: option.id,
            optionName: option.name,
            values: values,
          };
          return response;
        } else {
          throw new NotFoundException('Option not found.');
        }
      });
      return myRes;
    } catch (error) {
      console.log(error.code);
      if (error.code === 'P2002') {
        throw new ConflictException('Value already exists.');
      } else {
        throw error;
      }
    }
  }

  async getOptionValuesByBaseProductSlug(slug: string) {
    try {
      const options = await this.prisma.option.findMany({
        where: {
          baseProduct: {
            slug: slug,
          },
        },
        include: {
          optionValues: true,
        },
      });

      const response: OptionValuesResponseDto[] = [];
      options.map((option) => {
        const values: ValueResponseDto[] = option.optionValues.map(
          (optionValue) => ({
            valueId: optionValue.id,
            valueName: optionValue.value,
          }),
        );

        response.push({
          optionId: option.id,
          optionName: option.name,
          values: values,
        });
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateOptionName(
    updateOptionNameRequestDto: UpdateOptionNameRequestDto,
  ) {
    try {
      const option = await this.prisma.option.update({
        where: { id: updateOptionNameRequestDto.optionId },
        data: {
          name: updateOptionNameRequestDto.name,
        },
      });
      return option;
    } catch (error) {
      throw error;
    }
  }

  async updateValueName(updateValueNameRequestDto: UpdateValueNameRequestDto) {
    try {
      const optionValue = await this.prisma.optionValue.update({
        where: { id: updateValueNameRequestDto.valueId },
        data: {
          value: updateValueNameRequestDto.name,
        },
      });
      return optionValue;
    } catch (error) {
      throw error;
    }
  }
}
