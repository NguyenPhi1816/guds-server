import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OptionValueService } from './option-value.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRoles } from 'src/constants/enum';
import { CreateOptionValuesRequestDto } from './dto';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

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
}
