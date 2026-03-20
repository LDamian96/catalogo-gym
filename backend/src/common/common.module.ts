import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { CacheService } from './services/cache.service';
import { SheetSyncService } from './services/sheet-sync.service';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [CloudinaryService, CacheService, SheetSyncService],
  exports: [CloudinaryService, CacheService, SheetSyncService],
})
export class CommonModule {}
