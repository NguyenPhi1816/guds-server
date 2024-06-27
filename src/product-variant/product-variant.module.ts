import { Module } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { OptionValueService } from 'src/option-value/option-value.service';

@Module({ providers: [ProductVariantService, OptionValueService] })
export class ProductVariantModule {}
