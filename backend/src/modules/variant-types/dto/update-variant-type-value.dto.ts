import { PartialType } from '@nestjs/swagger';
import { CreateVariantTypeValueDto } from './create-variant-type-value.dto';

export class UpdateVariantTypeValueDto extends PartialType(CreateVariantTypeValueDto) {}
