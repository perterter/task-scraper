import { Module } from '@nestjs/common';
import { EnumServiceModule } from '../../../core/services/enum/enum-service.module';
import { StructServiceModule } from '../../../core/services/struct/struct-service.module';
import { TasksCommand } from './tasks-command';

@Module({
  imports: [StructServiceModule, EnumServiceModule],
  providers: [TasksCommand],
})
export class TasksCommandModule {}

