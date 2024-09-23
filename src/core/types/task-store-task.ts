import { ITask, ITaskSkill } from './task-mockup.interface';

export class TaskStoreTask implements ITask {
  structId: number;
  sortId: number;
  skills: ITaskSkill[];
  metadata: { [key: string]: string | number };

  constructor(storeData: any) {
    this.structId = storeData.structId;
    this.sortId = storeData.sortId;
    this.skills = storeData.skills;
    this.metadata = storeData.metadata;
  }
}
