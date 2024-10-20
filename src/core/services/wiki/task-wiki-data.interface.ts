import { ITaskSkill } from '../../types/task-mockup.interface';

export interface ITaskWikiData {
  varbitIndex: number;
  skills?: ITaskSkill[];
  notes?: string;
  completionPercent?: number;
}
