import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCategoryDto } from './dto';
import { normalizeName } from 'src/utils/normalize-name.util';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories() {
    const categories =
      await this.prisma.category.findMany();
    return categories;
  }

  async addCategory(
    addCategoryDto: AddCategoryDto,
  ) {
    try {
      const category =
        await this.prisma.category.create({
          data: {
            Name: addCategoryDto.name,
            Image: addCategoryDto.image,
            Slug: normalizeName(
              addCategoryDto.name,
            ),
            Description:
              addCategoryDto.description,
          },
        });
      return category;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Category name must be unique',
        );
      } else {
        throw new BadRequestException(error);
      }
    }
  }
}
