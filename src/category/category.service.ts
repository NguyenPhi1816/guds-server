import { Injectable } from '@nestjs/common';
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
    const category =
      await this.prisma.category.create({
        data: {
          Name: addCategoryDto.name,
          Image: addCategoryDto.image,
          Slug: normalizeName(
            addCategoryDto.name,
          ),
          Description: addCategoryDto.description,
        },
      });
    return category;
  }
}
