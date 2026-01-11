import { Module } from '@nestjs/common';
import { ImportExportController } from './import-export.controller';
import { ImportService } from './import.service';
import { ExportService } from './export.service';
import { DatabaseModule } from '../../database/database.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [ImportExportController],
  providers: [ImportService, ExportService],
  exports: [ImportService, ExportService],
})
export class ImportExportModule {}
