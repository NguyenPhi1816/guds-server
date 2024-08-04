import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtGuard } from 'src/auth/guard';
import { CreateBrandDto, GetBrandBySlugParams, UpdateBrandDto } from './dto';

@Controller('api/brands')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Get()
  getAllBrands() {
    return this.brandService.getAllBrands();
  }

  @Get('/product/:slug')
  getBrandProduct(@Param() params: GetBrandBySlugParams) {
    return this.brandService.getBrandProduct(params.slug);
  }

  @Get('/:slug')
  getBrandBySlug(
    @Param() params: GetBrandBySlugParams,
    @Query('fromPrice') fromPrice?: number,
    @Query('toPrice') toPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.brandService.getBrandBySlug(
      params.slug,
      fromPrice,
      toPrice,
      sortBy,
      page,
      limit,
    );
  }

  @Post()
  @UseGuards(RolesGuard, JwtGuard)
  createBrand(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.createBrand(createBrandDto);
  }

  @Put()
  @UseGuards(RolesGuard, JwtGuard)
  updateBrand(@Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.updateBrand(updateBrandDto);
  }
}
