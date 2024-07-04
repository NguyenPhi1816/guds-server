import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OptionValueService } from './option-value.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRoles } from 'src/constants/enum';
import {
  AddValuesToOptionRequestDto,
  CreateOptionValuesRequestDto,
  GetOptionValuesByBaseProductSlugParams,
  UpdateOptionNameRequestDto,
  UpdateOptionStatusRequestDto,
  UpdateValueNameRequestDto,
  UpdateValueStatusRequestDto,
} from './dto';

@Controller('api/option-values')
export class OptionValueController {
  constructor(private optionValueService: OptionValueService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  createOptionValues(
    @Body() createOptionValuesRequestDto: CreateOptionValuesRequestDto,
  ) {
    return this.optionValueService.createOptionValues(
      createOptionValuesRequestDto,
    );
  }

  @Get('/:baseProductSlug')
  getOptionValuesByBaseProductSlug(
    @Param() params: GetOptionValuesByBaseProductSlugParams,
  ) {
    return this.optionValueService.getOptionValuesByBaseProductSlug(
      params.baseProductSlug,
    );
  }

  @Post('add-values')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  addValuesToOption(
    @Body() addValuesToOptionRequestDto: AddValuesToOptionRequestDto,
  ) {
    return this.optionValueService.addValuesToOption(
      addValuesToOptionRequestDto,
    );
  }

  @Put('update-option-name')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  updateOptionName(
    @Body() updateOptionNameRequestDto: UpdateOptionNameRequestDto,
  ) {
    return this.optionValueService.updateOptionName(updateOptionNameRequestDto);
  }

  @Put('update-option-status')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  updateOptionStatus(
    @Body() updateOptionStatusRequestDto: UpdateOptionStatusRequestDto,
  ) {
    return this.optionValueService.updateOptionStatus(
      updateOptionStatusRequestDto,
    );
  }

  @Put('update-value-name')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  updateValueName(
    @Body() updateValueNameRequestDto: UpdateValueNameRequestDto,
  ) {
    return this.optionValueService.updateValueName(updateValueNameRequestDto);
  }

  @Put('update-value-status')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  updateValueStatus(
    @Body() updateValueStatusRequestDto: UpdateValueStatusRequestDto,
  ) {
    return this.optionValueService.updateValueStatus(
      updateValueStatusRequestDto,
    );
  }
}
