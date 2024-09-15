import { Module } from '@nestjs/common';
import { StructServiceModule } from '../../../core/services/struct/struct-service.module';
import { TasksCommand } from './tasks-command';

@Module({
  imports: [StructServiceModule],
  providers: [TasksCommand],
})
export class TasksCommandModule {}

