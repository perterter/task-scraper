import { Module } from '@nestjs/common';
import { StructServiceModule } from '../struct/struct-service.module';
import { WikiService } from './wiki.service';

@Module({
  imports: [StructServiceModule],
  providers: [WikiService],
  exports: [WikiService],
})
export class WikiServiceModule {}
