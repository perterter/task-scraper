import { Module } from '@nestjs/common';
import { StructServiceModule } from '../../../core/services/struct/struct-service.module';
import { StructCommand } from './struct-command';

@Module({
  imports: [StructServiceModule],
  providers: [StructCommand],
})
export class StructCommandModule {}

