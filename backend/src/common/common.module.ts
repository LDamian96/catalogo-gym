import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { CacheService } from './services/cache.service';

@Global()
@Module({
  providers: [CloudinaryService, CacheService],
  exports: [CloudinaryService, CacheService],
})
export class CommonModule {}
