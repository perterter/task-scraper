export interface ITask {
  id: number;
  name: string;
  description: string;
  clientSortId: number;
  params?: { [key: number]: any };
}

