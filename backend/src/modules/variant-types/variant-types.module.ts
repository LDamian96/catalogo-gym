import { Module } from '@nestjs/common';
import { VariantTypesController } from './variant-types.controller';
import { VariantTypesService } from './variant-types.service';

@Module({
  controllers: [VariantTypesController],
  providers: [VariantTypesService],
  exports: [VariantTypesService],
})
export class VariantTypesModule {}
