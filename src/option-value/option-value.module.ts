import { Module } from '@nestjs/common';
import { OptionValueService } from './option-value.service';
import { OptionValueController } from './option-value.controller';

@Module({
  providers: [OptionValueService],
  controllers: [OptionValueController]
})
export class OptionValueModule {}
