import { Enum, ParamID, Struct } from '@abextm/cache2';
import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { PARAM_ID } from '../../../core/data/param-ids';
import { replacer } from '../../../core/json-replacer';
import { EnumService } from '../../../core/services/enum/enum.service';
import { StructService } from '../../../core/services/struct/struct.service';
import { ITask } from '../../../core/types/task-mockup.interface';
import { ITaskType } from '../../../core/types/task-type-mockup.interface';
import { InteractivePrompt } from '../../interactive-prompt.util';
import { ISelectOption } from '../../select-option.interface';

@Injectable()
export class TasksCommand {
  constructor(private structService: StructService, private enumService: EnumService) {}

  public async interactiveTaskExtraction() {
    const mainParams = ['id', 'name', 'description', 'tier'];

    // find structs based on a param id
    const paramIdInput: string = await InteractivePrompt.input('enter a param id to search for task structs');
    const findParamId: ParamID = Number.parseInt(paramIdInput) as ParamID;
    const structs: Struct[] = await this.structService.findByParam(findParamId);

    // map param ids to properties (show an example so you can easily identify)
    const exampleStruct: Struct = structs[0];
    const example: any = await this.structService.getSampleValuesForSameParams(exampleStruct);
    console.log('example to map from:');
    console.log(JSON.stringify(example, replacer, 2));

    // map main params
    const paramMap = new Map<string, ParamID>();
    let unmappedParams: ISelectOption<ParamID>[] = Array.from(exampleStruct.params.keys()).map((paramId) => ({
      name: '' + paramId,
      value: paramId,
    }));
    for (const paramName of mainParams) {
      const paramId: ParamID = await InteractivePrompt.select(`select the param for ${paramName}`, unmappedParams);
      paramMap.set(paramName, paramId);
      unmappedParams = unmappedParams.filter((unmapped) => unmapped.value !== paramId);
    }

    // map other params
    let isMappingAdditional = unmappedParams.length > 0;
    while (isMappingAdditional) {
      const shouldContinue: boolean = await InteractivePrompt.confirm(
        `there are ${unmappedParams.length} remaining unmapped params. would you like to map them?`,
      );
      if (!shouldContinue) {
        break;
      }
      const paramId: ParamID = await InteractivePrompt.select('select the param to map', unmappedParams);
      const paramName: string = await InteractivePrompt.input('enter the parameter name');
      paramMap.set(paramName, paramId);
      unmappedParams = unmappedParams.filter((unmapped) => unmapped.value !== paramId);
    }

    // set task type name
    const name: string = await InteractivePrompt.input('enter the task type name');
    console.log(
      JSON.stringify(
        {
          name,
          paramMap,
        },
        replacer,
        2,
      ),
    );

    // TODO: extract tasks
    // -- use the enum sorting algo in combat tasks
  }
  public async interactiveTaskExtractionV2(options: any) {
    const mainParams = ['id', 'name', 'description', 'tier'];

    // search a name of a task => get name param id
    const taskNameInput: string =
      options.taskName ?? (await InteractivePrompt.input('enter a task name to get started'));
    const taskStructs: Struct[] = await this.structService.findStructs(taskNameInput);
    if (taskStructs.length === 0) {
      throw new Error(`no structs found for task name string: ${taskNameInput}`);
    }
    if (taskStructs.length > 1) {
      throw new Error('refine the task name search; more than one task found for name string: ' + taskNameInput);
    }

    const foundTaskStruct: Struct = taskStructs[0];
    const example: any = await this.structService.getSampleValuesForSameParams(foundTaskStruct);
    console.log('example to map from:');
    console.log(JSON.stringify(example, replacer, 2));

    // map all param ids
    const paramMap = new Map<string, ParamID>();
    let unmappedParams: ISelectOption<ParamID>[] = Array.from(foundTaskStruct.params.keys()).map((paramId) => ({
      name: '' + paramId,
      value: paramId,
    }));
    for (const paramName of mainParams) {
      const paramId: ParamID =
        options[paramName + 'Param'] ??
        (await InteractivePrompt.select(`select the param for ${paramName}`, unmappedParams));
      paramMap.set(paramName, paramId);
      unmappedParams = unmappedParams.filter((unmapped) => unmapped.value !== paramId);
    }

    // map other params
    let isMappingAdditional = options.addlParams !== false && unmappedParams.length > 0;
    while (isMappingAdditional) {
      const shouldContinue: boolean = await InteractivePrompt.confirm(
        `there are ${unmappedParams.length} remaining unmapped params. would you like to map them?`,
      );
      if (!shouldContinue) {
        break;
      }
      const paramId: ParamID = await InteractivePrompt.select('select the param to map', unmappedParams);
      const paramName: string = await InteractivePrompt.input('enter the parameter name');
      paramMap.set(paramName, paramId);
      unmappedParams = unmappedParams.filter((unmapped) => unmapped.value !== paramId);
    }

    // search for all task structs with name param id, use tier because name returning ones with undefined tiers
    const allTaskStructs: Struct[] = (await this.structService.findByParam(paramMap.get('tier'))).filter((s) => {
      const tierId: number = s.params.get(paramMap.get('tier')) as number;
      if (tierId === 100 && paramMap.get('tier') === PARAM_ID.CA_TIER_ID) {
        // edge case for some christmas achievements that used combat achievement struct params
        // as of 9/22/2024, struct id 740 is the only remaining "can't stop" with tier id 100
        // https://oldschool.runescape.wiki/w/2023_Christmas_event
        return false;
      }
      return tierId !== undefined;
    });

    // group by tier (difficulty)
    const tierTaskStructsMap = new Map<number, Struct[]>();
    allTaskStructs.forEach((taskStruct) => {
      const tierId: number = taskStruct.params.get(paramMap.get('tier')) as number;
      const structsInTier = tierTaskStructsMap.get(tierId) || [];
      tierTaskStructsMap.set(tierId, [...structsInTier, taskStruct]);
    });

    let tierEnums: number[] = [];
    for (const [tierId, structs] of tierTaskStructsMap.entries()) {
      const sample: Struct = structs[5];
      const possibleEnums: Enum[] = await this.enumService.findEnumsByStruct(sample.id);
      const tierStructIds: number[] = structs.map((s) => s.id);
      const filteredEnums = possibleEnums.filter((e) => {
        const enumStructIds: Set<number> = new Set(e.map.values() as IterableIterator<number>);
        for (const tierStructId of tierStructIds) {
          if (tierStructId === 1949 || tierStructId === 5704) {
            // Two odd structs from leagues 4
            continue;
          }
          if (!enumStructIds.has(tierStructId)) {
            console.warn(`tierStructId ${tierStructId} not found in enumStructIds of enum ${e.id}`);
            return false;
          }
        }
        return true;
      });
      if (filteredEnums.length === 0) {
        throw new Error(`could not find enum for tier ${tierId} from possible`);
      }
      if (filteredEnums.length > 1) {
        throw new Error(`too many enums for tier ${tierId} after filtering`);
      }
      tierEnums[tierId] = filteredEnums[0].id;
    }

    // League 4 had all tasks in 1 enum. Combat has them in separate
    const allEqual = tierEnums.filter((value) => !!value).every((value) => value === tierEnums[1]);
    if (allEqual) {
      tierEnums = [tierEnums[1]];
    }
    console.log('tierEnums', tierEnums);

    // use enums to pull tasks in proper order
    const orderedStructIds: number[] = [];
    for (let enumId of tierEnums) {
      if (!enumId) {
        // unsure if 0 indexed so skip undefined values
        continue;
      }
      const orderedDifficultyStructIds: Map<number, string | number> = (await this.enumService.getEnum(enumId)).map;
      for (const structId of orderedDifficultyStructIds.values()) {
        orderedStructIds.push(structId as number);
      }
    }

    const allTaskStructedOrdered: Struct[] = [];
    for (let structId of orderedStructIds) {
      const taskStruct: Struct = await this.structService.getStruct(structId);
      allTaskStructedOrdered.push(taskStruct);
    }

    if (allTaskStructs.length !== allTaskStructedOrdered.length) {
      if (
        paramMap.get('tier') === PARAM_ID.LEAGUE_TIER_ID &&
        allTaskStructs.length === 1482 &&
        allTaskStructedOrdered.length === 1480
      ) {
        // Skip mismatch if League 4 and the task count is off by 2
        // Two odd tasks not in the struct, contentious whether they actually exist
      } else {
        throw new Error(
          `task count after enum pulls does not match initial count by name param ${allTaskStructs.length}!=${allTaskStructedOrdered.length}`,
        );
      }
    }

    const allTasksFormatted: ITask[] = allTaskStructedOrdered.map((s, i) => {
      const out: ITask = {
        structId: s.id,
        sortId: i,
      };
      return out;
    });

    // set task type name
    const name: string = options.name ?? (await InteractivePrompt.input('enter the task type name'));
    const description: string = options.description ?? (await InteractivePrompt.input('enter a task type description'));
    const taskJsonName: string = options.taskJsonName ?? (await InteractivePrompt.input('enter a task json name'));
    const taskTypeDefinition: ITaskType = {
      name,
      description,
      isEnabled: false,
      taskJsonName,
      paramMap: Object.fromEntries(paramMap),
      filters: {},
      taskVarps: [],
      otherVarps: [],
      varbits: [],
      pointMap: [],
    };
    console.log('DONE!');
    console.log(JSON.stringify(taskTypeDefinition, replacer, 2));
    console.log(JSON.stringify(allTasksFormatted, replacer));
  }

  public async handleCompareCombat() {
    const newjsonstore = readFileSync('./new.json').toString();
    const oldjsonstore = readFileSync('./old.json').toString();
    const out = JSON.parse(newjsonstore);
    out.forEach((outItem, i) => {
      console.log(oldjsonstore[i], outItem);
    });
  }

  public async handleCombatTasks(options: any): Promise<ITask[]> {
    const orderedStructIds: number[] = [];

    const difficultyEnums: number[] = [3981, 3982, 3983, 3984, 3985, 3986];
    for (let enumId of difficultyEnums) {
      const orderedDifficultyStructIds: Map<number, string | number> = (await this.enumService.getEnum(enumId)).map;
      for (const structId of orderedDifficultyStructIds.values()) {
        orderedStructIds.push(structId as number);
      }
    }

    const allTaskStructs: Struct[] = [];
    for (let structId of orderedStructIds) {
      const taskStruct: Struct = await this.structService.getStruct(structId);
      allTaskStructs.push(taskStruct);
    }

    let allTasksFormatted: any[] = [];

    if (options.legacy) {
      allTasksFormatted = allTaskStructs.map((s, i) => {
        const out = {
          id: '' + (s.params.get(PARAM_ID.CA_VARBIT_INDEX) as number),
          monster: '' + (s.params.get(PARAM_ID.CA_MONSTER_ID) as number),
          name: s.params.get(PARAM_ID.CA_NAME) as string,
          description: s.params.get(PARAM_ID.CA_DESCRIPTION) as string,
          category: '',
          tier: this.getLegacyTier(s.params.get(PARAM_ID.CA_TIER_ID) as number),
          clientSortId: '' + i,
        };
        return out;
      });
    } else {
      allTasksFormatted = allTaskStructs.map((s, i) => {
        const out: ITask = {
          structId: s.id,
          sortId: i,
        };
        return out;
      });
    }

    if (options.json) {
      this.writeToFile(allTasksFormatted, 'combat.json');
    } else {
      console.log(JSON.stringify(allTasksFormatted, replacer));
    }
    return allTasksFormatted;
  }

  public async handleLeagues4(options: any): Promise<ITask[]> {
    const structId: ParamID = 873 as ParamID;
    const sortFunction = (a: Struct, b: Struct) => {
      const aSort = a.params.get(structId) as number;
      const bSort = b.params.get(structId) as number;
      return aSort - bSort;
    };
    const tierParamId: ParamID = 1852 as ParamID;
    const easy: Struct[] = (await this.structService.findByParam(tierParamId, 1)).sort(sortFunction);
    const medium: Struct[] = (await this.structService.findByParam(tierParamId, 2)).sort(sortFunction);
    const hard: Struct[] = (await this.structService.findByParam(tierParamId, 3)).sort(sortFunction);
    const elite: Struct[] = (await this.structService.findByParam(tierParamId, 4)).sort(sortFunction);
    const master: Struct[] = (await this.structService.findByParam(tierParamId, 5)).sort(sortFunction);
    const all = [...easy, ...medium, ...hard, ...elite, ...master];
    let allAsTasks: any[] = [];

    if (options.legacy) {
      allAsTasks = all.map((s, i) => {
        const out = {
          id: '' + (s.params.get(structId) as number),
          monster: '',
          name: s.params.get(874 as ParamID) as string,
          description: s.params.get(875 as ParamID) as string,
          category: '',
          tier: '',
          clientSortId: '' + i,
        };
        return out;
      });
    } else {
      allAsTasks = all.map((s, i) => {
        const out: ITask = {
          structId: s.params.get(structId) as number,
          sortId: i,
        };
        return out;
      });
    }

    if (options.json) {
      this.writeToFile(allAsTasks, 'leagues_4.json');
    } else {
      console.log(JSON.stringify(allAsTasks, replacer));
    }

    return allAsTasks;
  }

  private writeToFile(obj: any, fileNameAndPath: string): void {
    writeFileSync('./out/' + fileNameAndPath, JSON.stringify(obj, null, 2));
  }

  private getLegacyTier(value: number): string {
    switch (value) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      case 4:
        return 'Elite';
      case 5:
        return 'Master';
      case 6:
        return 'Grandmaster';
      default:
        throw new Error('invalid value ' + value);
    }
  }
}

