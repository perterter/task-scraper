import { ITask } from './task.interface';

export class TaskStoreTask implements ITask {
  id: number;
  name: string;
  description: string;
  clientSortId: number;
  params?: { [key: number]: any };

  constructor(storeData: any) {
    this.id = Number.parseInt(storeData.id);
    this.name = storeData.name;
    this.description = storeData.description;
    this.clientSortId = Number.parseInt(storeData.clientSortId);
  }
}
