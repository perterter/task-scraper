import { ParamID, Struct } from '@abextm/cache2';
import { Injectable } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { GitHubFile } from '../../../core/github/github-file.interface';
import { replacer } from '../../../core/json-replacer';
import { StructService } from '../../../core/services/struct/struct.service';
import { TaskStoreTask } from '../../../core/types/task-store-task';
import { ITask } from '../../../core/types/task.interface';
import { InteractivePrompt } from '../../interactive-prompt.util';
import { ISelectOption } from '../../select-option.interface';

@Injectable()
export class TasksCommand {
  constructor(private structService: StructService) {}

  public async handleCombatTasks(): Promise<ITask[]> {
    const sortParamId: ParamID = 1306 as ParamID;
    const sortFunction = (a: Struct, b: Struct) => {
      const aSort = a.params.get(sortParamId) as number;
      const bSort = b.params.get(sortParamId) as number;
      return aSort - bSort;
    };
    const easy: Struct[] = (await this.structService.findByParam(1310 as ParamID, 1)).sort(sortFunction);
    const medium: Struct[] = (await this.structService.findByParam(1310 as ParamID, 2)).sort(sortFunction);
    const hard: Struct[] = (await this.structService.findByParam(1310 as ParamID, 3)).sort(sortFunction);
    const elite: Struct[] = (await this.structService.findByParam(1310 as ParamID, 4)).sort(sortFunction);
    const master: Struct[] = (await this.structService.findByParam(1310 as ParamID, 5)).sort(sortFunction);
    const grandmaster: Struct[] = (await this.structService.findByParam(1310 as ParamID, 6)).sort(sortFunction);
    const all = [...easy, ...medium, ...hard, ...elite, ...master, ...grandmaster];
    const allAsTasks = all.map((s) => {
      const out: ITask = {
        id: s.params.get(sortParamId) as number,
        name: s.params.get(1308 as ParamID) as string,
        description: s.params.get(1309 as ParamID) as string,
        clientSortId: s.params.get(sortParamId) as number,
        params: {},
      };
      return out;
    });
    console.log(JSON.stringify(allAsTasks, replacer));
    return allAsTasks;
  }

  public async handleLeagues4(): Promise<ITask[]> {
    const sortParamId: ParamID = 873 as ParamID;
    const sortFunction = (a: Struct, b: Struct) => {
      const aSort = a.params.get(sortParamId) as number;
      const bSort = b.params.get(sortParamId) as number;
      return aSort - bSort;
    };
    const difficultyParamId: ParamID = 1852 as ParamID;
    const easy: Struct[] = (await this.structService.findByParam(difficultyParamId, 1)).sort(sortFunction);
    const medium: Struct[] = (await this.structService.findByParam(difficultyParamId, 2)).sort(sortFunction);
    const hard: Struct[] = (await this.structService.findByParam(difficultyParamId, 3)).sort(sortFunction);
    const elite: Struct[] = (await this.structService.findByParam(difficultyParamId, 4)).sort(sortFunction);
    const master: Struct[] = (await this.structService.findByParam(difficultyParamId, 5)).sort(sortFunction);
    const all = [...easy, ...medium, ...hard, ...elite, ...master];
    const allAsTasks = all.map((s) => {
      const out: ITask = {
        id: s.params.get(sortParamId) as number,
        name: s.params.get(874 as ParamID) as string,
        description: s.params.get(875 as ParamID) as string,
        clientSortId: s.params.get(sortParamId) as number,
      };
      return out;
    });
    console.log(JSON.stringify(allAsTasks, replacer));
    return allAsTasks;
  }

  public async handleInteractiveCompare(): Promise<void> {
    const storeJsonDirectoryUrl: string = 'https://api.github.com/repos/osrs-reldo/task-json-store/contents/json';
    const data: GitHubFile[] = await this.loadJsonFromGithub(storeJsonDirectoryUrl);
    const jsonFiles: GitHubFile[] = data.filter((item: any) => item.type === 'file' && item.name.endsWith('.json'));
    const selections: ISelectOption<GitHubFile>[] = jsonFiles.map((jsonFile) => ({
      name: jsonFile.name,
      value: jsonFile,
    }));
    const selectedFile: GitHubFile = await InteractivePrompt.select('select a json store', selections);
    console.log(selectedFile.download_url);
    // const structIdInput: string = await InteractivePrompt.input(
    //   'input a param id that will be used to find all structs for the task type',
    // );
    // const structId: ParamID = Number.parseInt(structIdInput) as ParamID;
    // const allTasks = await this.structService.findByParam(structId);
    // await this.compareToStore(allTasks, storeTasksUrl);
  }

  private async compareToStore(newTasks: ITask[], storeUrl: string): Promise<void> {
    const oldJson: any[] = await this.loadJsonFromGithub(storeUrl);
    const oldTasks: ITask[] = oldJson.map((storeData) => new TaskStoreTask(storeData));

    console.log('mismatches', this.getMismatches(oldTasks, newTasks));
    console.log('differences', this.getDifferencesById(oldTasks, newTasks, { a: 'old', b: 'new' }));
    console.log('lengths', {
      old: oldTasks.length,
      new: newTasks.length,
    });
    this.writeToFile(oldTasks, './old-tasks.json');
    this.writeToFile(newTasks, './new-tasks.json');
  }

  private writeToFile(obj: any, fileNameAndPath: string): void {
    writeFileSync(fileNameAndPath, JSON.stringify(obj, null, 2));
  }

  private getMismatches(oldTasks: ITask[], newTasks: ITask[]): any[] {
    const newTasksById = this.arrayToMapById(newTasks);

    const mismatches = [];
    for (const oldTask of oldTasks) {
      const newTask = newTasksById.get(oldTask.id);
      if (!newTask) {
        mismatches.push({
          oldTask,
          newTask,
        });
        continue;
      }
      if (newTask.name !== oldTask.name || newTask.description !== oldTask.description || newTask.id !== oldTask.id) {
        mismatches.push({
          oldTask,
          newTask,
        });
      }
    }
    return mismatches;
  }

  private getDifferencesById(a: ITask[], b: ITask[], names?: { a: string; b: string }): { [key: string]: number[] } {
    const bIds = b.map((item) => item.id);
    const aIds = a.map((item) => item.id);

    const bIdSet = new Set(bIds);
    const aIdSet = new Set(aIds);

    const aNotInB = aIds.filter((id) => !bIdSet.has(id));
    const bNotInA = bIds.filter((id) => !aIdSet.has(id));

    if (names) {
      return {
        [`${names.a} not in ${names.b}`]: aNotInB,
        [`${names.b} not in ${names.a}`]: bNotInA,
      };
    }
    return {
      aNotInB,
      bNotInA,
    };
  }

  private arrayToMapById<T>(array: T[]): Map<number, T> {
    const map = new Map<number, T>();
    for (const obj of array) {
      map.set(obj['id'], obj);
    }
    return map;
  }

  private async loadJsonFromGithub(url: string): Promise<any> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching JSON:', error);
      throw error;
    }
  }
}

