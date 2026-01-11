import { Module } from '@nestjs/common';
import { TrackingPixelsController } from './tracking-pixels.controller';
import { TrackingPixelsService } from './tracking-pixels.service';

@Module({
  controllers: [TrackingPixelsController],
  providers: [TrackingPixelsService],
  exports: [TrackingPixelsService],
})
export class TrackingPixelsModule {}
