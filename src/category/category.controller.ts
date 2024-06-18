import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRoles } from 'src/constants/enum';
import { AddCategoryDto } from './dto';
import { CategoryService } from './category.service';

@Controller('api/categories')
export class CategoryController {
  constructor(
    private categoryService: CategoryService,
  ) {}

  @Get()
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  addCategory(
    @Body() addCategoryDto: AddCategoryDto,
  ) {
    return this.categoryService.addCategory(
      addCategoryDto,
    );
  }
}
