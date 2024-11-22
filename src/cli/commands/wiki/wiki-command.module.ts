import { Module } from '@nestjs/common';
import { EnumServiceModule } from '../../../core/services/enum/enum-service.module';
import { StructServiceModule } from '../../../core/services/struct/struct-service.module';
import { WikiServiceModule } from '../../../core/services/wiki/wiki-service.module';
import { WikiCommand } from './wiki-command';

@Module({
  imports: [StructServiceModule, EnumServiceModule, WikiServiceModule],
  providers: [WikiCommand],
})
export class WikiCommandModule {}

