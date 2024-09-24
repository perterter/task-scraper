import { ITask } from '../../../core/types/task-mockup.interface';
import { ITaskType } from '../../../core/types/task-type-mockup.interface';

export interface IInteractiveTaskExtractResult {
  taskType: ITaskType;
  tasks: ITask[];
}
