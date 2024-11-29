import { ITask } from '../../../core/types/task-mockup.interface';
import { ITaskType } from '../../../core/types/task-type-mockup.interface';

export interface IInteractiveTaskExtractResult {
  taskJsonName: string;
  taskType: ITaskType;
  tasks: ITask[];
}
