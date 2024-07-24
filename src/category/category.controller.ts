import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRoles } from 'src/constants/enum';
import { AddCategoryDto, SlugParams, UpdateCategoryDto } from './dto';
import { CategoryService } from './category.service';

@Controller('api/categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Get('/client')
  getClientAllCategories() {
    return this.categoryService.getClientAllCategories();
  }

  @Get('/children/:slug')
  getCategoryChildren(@Param() params: SlugParams) {
    return this.categoryService.getCategoryChildren(params.slug);
  }

  @Get('/product/:slug')
  getCategoryProduct(@Param() params: SlugParams) {
    return this.categoryService.getCategoryProducts(params.slug);
  }

  @Get('/:slug')
  getBySlug(@Param() params: SlugParams) {
    return this.categoryService.getBySlug(params.slug);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  addCategory(@Body() addCategoryDto: AddCategoryDto) {
    return this.categoryService.addCategory(addCategoryDto);
  }

  @Put()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  updateCategory(@Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.updateCategory(updateCategoryDto);
  }
}
