import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheProviderModule } from './core/cache-provider.module';
import { StructService } from './core/services/struct/struct.service';

@Module({
  imports: [CacheProviderModule],
  controllers: [AppController],
  providers: [AppService, StructService],
})
export class AppModule {}

