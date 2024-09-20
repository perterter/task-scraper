import { Module } from '@nestjs/common';
import { EnumServiceModule } from '../../../core/services/enum/enum-service.module';
import { EnumCommand } from './enum-command';

@Module({
  imports: [EnumServiceModule],
  providers: [EnumCommand],
})
export class EnumCommandModule {}

