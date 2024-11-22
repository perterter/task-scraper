import { ITaskSkill } from '../../types/task-mockup.interface';

export interface ITaskWikiData {
  name?: string;
  description?: string;
  varbitIndex: number;
  skills?: ITaskSkill[];
  notes?: string;
  completionPercent?: number;
}
