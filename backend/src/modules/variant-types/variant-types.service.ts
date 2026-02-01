import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VariantType, VariantTypeValue } from '@prisma/client';
import { CreateVariantTypeDto, UpdateVariantTypeDto, CreateVariantTypeValueDto, UpdateVariantTypeValueDto } from './dto';

type VariantTypeWithValues = VariantType & {
  values: VariantTypeValue[];
};

@Injectable()
export class VariantTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false): Promise<VariantTypeWithValues[]> {
    return this.prisma.variantType.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        values: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findOne(id: string): Promise<VariantTypeWithValues> {
    const variantType = await this.prisma.variantType.findUnique({
      where: { id },
      include: {
        values: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!variantType) {
      throw new NotFoundException('Tipo de variante no encontrado');
    }

    return variantType;
  }

  async create(dto: CreateVariantTypeDto): Promise<VariantType> {
    // Check if name already exists
    const existing = await this.prisma.variantType.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Ya existe un tipo de variante con ese nombre');
    }

    // Get max order
    const maxOrder = await this.prisma.variantType.aggregate({
      _max: { order: true },
    });
    const order = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    return this.prisma.variantType.create({
      data: {
        name: dto.name,
        description: dto.description,
        order,
        isActive: dto.isActive ?? true,
        showAsFilter: dto.showAsFilter ?? false,
        showInLanding: dto.showInLanding ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateVariantTypeDto): Promise<VariantType> {
    await this.findOne(id); // Verify exists

    // Check if new name conflicts
    if (dto.name) {
      const existing = await this.prisma.variantType.findFirst({
        where: {
          name: dto.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Ya existe un tipo de variante con ese nombre');
      }
    }

    return this.prisma.variantType.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    const variantType = await this.prisma.variantType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productValues: true,
            productVariantValues: true,
          },
        },
      },
    });

    if (!variantType) {
      throw new NotFoundException('Tipo de variante no encontrado');
    }

    // Check if in use
    const inUse = variantType._count.productValues > 0 || variantType._count.productVariantValues > 0;
    if (inUse) {
      throw new ConflictException(
        'No se puede eliminar el tipo de variante porque está siendo usado por productos'
      );
    }

    await this.prisma.variantType.delete({
      where: { id },
    });
  }

  async reorder(items: { id: string; order: number }[]): Promise<VariantTypeWithValues[]> {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.variantType.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    return this.findAll(true);
  }

  // =============================================
  // VARIANT TYPE VALUES (Valores predefinidos)
  // =============================================

  async createValue(variantTypeId: string, dto: CreateVariantTypeValueDto): Promise<VariantTypeValue> {
    // Verify type exists
    await this.findOne(variantTypeId);

    // Check if value already exists for this type
    const existing = await this.prisma.variantTypeValue.findUnique({
      where: {
        variantTypeId_value: {
          variantTypeId,
          value: dto.value,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe ese valor para este tipo de variante');
    }

    // Get max order
    const maxOrder = await this.prisma.variantTypeValue.aggregate({
      where: { variantTypeId },
      _max: { order: true },
    });
    const order = dto.order ?? (maxOrder._max.order ?? -1) + 1;

    return this.prisma.variantTypeValue.create({
      data: {
        variantTypeId,
        value: dto.value,
        order,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateValue(id: string, dto: UpdateVariantTypeValueDto): Promise<VariantTypeValue> {
    const existing = await this.prisma.variantTypeValue.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Valor no encontrado');
    }

    // Check if new value conflicts
    if (dto.value && dto.value !== existing.value) {
      const conflict = await this.prisma.variantTypeValue.findUnique({
        where: {
          variantTypeId_value: {
            variantTypeId: existing.variantTypeId,
            value: dto.value,
          },
        },
      });

      if (conflict) {
        throw new ConflictException('Ya existe ese valor para este tipo de variante');
      }
    }

    return this.prisma.variantTypeValue.update({
      where: { id },
      data: dto,
    });
  }

  async deleteValue(id: string): Promise<void> {
    const existing = await this.prisma.variantTypeValue.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Valor no encontrado');
    }

    await this.prisma.variantTypeValue.delete({
      where: { id },
    });
  }

  async reorderValues(variantTypeId: string, items: { id: string; order: number }[]): Promise<VariantTypeValue[]> {
    await this.findOne(variantTypeId); // Verify type exists

    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.variantTypeValue.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    const values = await this.prisma.variantTypeValue.findMany({
      where: { variantTypeId },
      orderBy: { order: 'asc' },
    });

    return values;
  }
}
