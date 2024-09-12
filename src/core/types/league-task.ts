export interface LeagueTask {
  id: number;
  name: string;
  description: string;
  clientSortId: number;
  params: { [key: number]: any };
}
