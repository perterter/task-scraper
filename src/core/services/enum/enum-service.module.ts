import { Module } from '@nestjs/common';
import { CacheProviderModule } from '../../cache-provider.module';
import { EnumService } from './enum.service';

@Module({
  imports: [CacheProviderModule],
  providers: [EnumService],
  exports: [EnumService],
})
export class EnumServiceModule {}

