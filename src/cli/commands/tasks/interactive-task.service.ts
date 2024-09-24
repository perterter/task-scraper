import { Enum, ParamID, Struct } from '@abextm/cache2';
import { Injectable } from '@nestjs/common';
import { PARAM_ID } from '../../../core/data/param-ids';
import { replacer } from '../../../core/json-replacer';
import { EnumService } from '../../../core/services/enum/enum.service';
import { StructService } from '../../../core/services/struct/struct.service';
import { ITask } from '../../../core/types/task-mockup.interface';
import { ITaskType } from '../../../core/types/task-type-mockup.interface';
import { InteractivePrompt } from '../../interactive-prompt.util';
import { ISelectOption } from '../../select-option.interface';
import { IInteractiveTaskExtractResult } from './interactive-task-extract-result.interface';

@Injectable()
export class InteractiveTaskService {
  private readonly MAIN_PARAMS = ['id', 'name', 'description', 'tier'];

  constructor(private structService: StructService, private enumService: EnumService) {}

  public async promptTaskExtraction(options: any): Promise<IInteractiveTaskExtractResult> {
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
    const example: any = await this.getSampleValuesForSameParams(foundTaskStruct);
    console.log('example to map from:');
    console.log(JSON.stringify(example, replacer, 2));

    const paramMap: Map<string, ParamID> = await this.promptExtractTaskParams(foundTaskStruct, options);

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

    let tierEnums: number[] = (await this.extractTierEnumIdsFromTasks(allTaskStructs, paramMap)).filter(
      (value) => !!value,
    );

    // League 4 had all tasks in 1 enum. Combat has them in separate
    const allEqual = tierEnums.every((value) => value === tierEnums[1]);
    if (allEqual) {
      tierEnums = [tierEnums[0]];
    }

    // use enums to pull tasks in proper order
    const orderedStructIds: number[] = await this.getStructIdsFromEnumIds(tierEnums);

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

    return {
      taskType: taskTypeDefinition,
      tasks: allTasksFormatted,
    };
  }

  private async getStructIdsFromEnumIds(enumIds: number[]): Promise<number[]> {
    const orderedStructIds: number[] = [];
    for (let enumId of enumIds) {
      if (!enumId) {
        // unsure if 0 indexed so skip undefined values
        continue;
      }
      const orderedEnumStructIds: Map<number, string | number> = (await this.enumService.getEnum(enumId)).map;
      for (const structId of orderedEnumStructIds.values()) {
        orderedStructIds.push(structId as number);
      }
    }
    return orderedStructIds;
  }

  private async extractTierEnumIdsFromTasks(taskStructs: Struct[], paramMap: Map<string, ParamID>): Promise<number[]> {
    // group by tier (difficulty)
    const tierTaskStructsMap = new Map<number, Struct[]>();
    taskStructs.forEach((taskStruct) => {
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
    return tierEnums;
  }

  private async promptExtractTaskParams(foundTaskStruct: Struct, options: any): Promise<Map<string, ParamID>> {
    const paramMap = new Map<string, ParamID>();
    let unmappedParams: ISelectOption<ParamID>[] = this.getSelectAParamOptions(
      Array.from(foundTaskStruct.params.keys()),
    );
    for (const paramName of this.MAIN_PARAMS) {
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
      if (paramId === -999) {
        break;
      }
      const paramName: string = await InteractivePrompt.input('enter the parameter name');
      paramMap.set(paramName, paramId);
      unmappedParams = unmappedParams.filter((unmapped) => unmapped.value !== paramId);
      isMappingAdditional = unmappedParams.length > 0;
    }
    return paramMap;
  }

  private async getSampleValuesForSameParams(sourceStruct: Struct): Promise<any> {
    const example: { [key: number]: any[] } = {};
    for (const paramId of sourceStruct.params.keys()) {
      const samples: Struct[] = (await this.structService.findByParam(paramId)).splice(0, 5);
      example[paramId] = samples.map((s) => s.params.get(paramId));
    }
    return example;
  }

  private getSelectAParamOptions(paramIds: ParamID[]): ISelectOption<ParamID>[] {
    const knownParamNamesById: Map<number, string> = new Map();
    Object.entries(PARAM_ID).forEach(([name, id]) => {
      knownParamNamesById.set(id, name);
    });
    const paramOptions: ISelectOption<ParamID>[] = [];
    paramIds.forEach((paramId) => {
      let knownNameSuffix: string = '';
      const knownName: string | undefined = knownParamNamesById.get(paramId);
      if (knownName) {
        knownNameSuffix = ` (${knownName})`;
      }
      const label: string = `${paramId}${knownNameSuffix}`;

      paramOptions.push({
        name: label,
        value: paramId,
      });
    });
    paramOptions.push({
      name: 'EXIT',
      value: -999 as ParamID,
    });
    return paramOptions;
  }
}
