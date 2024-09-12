import { Module } from '@nestjs/common';
import { CacheProviderModule } from '../../cache-provider.module';
import { StructService } from './struct.service';

@Module({
  imports: [CacheProviderModule],
  providers: [StructService],
  exports: [StructService],
})
export class StructServiceModule {}

