import { Module } from '@nestjs/common';
import { CacheServiceModule } from '../../../core/services/cache-service.module';
import { CacheCommand } from './cache-command';

@Module({
  imports: [CacheServiceModule],
  providers: [CacheCommand],
})
export class CacheCommandModule {}

