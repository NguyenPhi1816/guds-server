import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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

  @Get('/:slug')
  getBrandBySlug(@Param() params: GetBrandBySlugParams) {
    return this.brandService.getBrandBySlug(params.slug);
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
