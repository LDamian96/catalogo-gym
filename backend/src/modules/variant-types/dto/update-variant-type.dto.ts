import { PartialType } from '@nestjs/swagger';
import { CreateVariantTypeDto } from './create-variant-type.dto';

export class UpdateVariantTypeDto extends PartialType(CreateVariantTypeDto) {}
