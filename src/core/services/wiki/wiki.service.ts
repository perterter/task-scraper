import { Struct } from '@abextm/cache2';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PARAM_ID } from '../../data/param-ids';
import { ITask } from '../../types/task-mockup.interface';
import { StructService } from '../struct/struct.service';
import { ITaskWikiData } from './task-wiki-data.interface';

// trialblazer
const NAME_COLUMN = 1;
const DESCRIPTION_COLUMN = 2;
const REQUIREMENTS_COLUMN = 3;
const POINTS_COLUMN = 4;
const COMPLETION_COLUMN = 5;

@Injectable()
export class WikiService {
  constructor(private structService: StructService) {}

  public async extractAndAppendData(tasks: ITask[], wikiUrl: string, taskIdAttribute: string): Promise<ITask[]> {
    const tasksByVarbitIndex: Map<number, ITask> = new Map();
    for (const task of tasks) {
      const struct: Struct = await this.structService.getStruct(task.structId);
      const varbitIndex = struct.params.get(PARAM_ID.LEAGUE_VARBIT_INDEX) as number;
      tasksByVarbitIndex.set(varbitIndex, task);
    }

    const extractedWikiData = await this.extractWikiData(wikiUrl, taskIdAttribute);

    for (const taskWikiData of extractedWikiData) {
      const task: ITask = tasksByVarbitIndex.get(taskWikiData.varbitIndex);
      if (!task) {
        throw new Error('task not found by varbit index ' + taskWikiData.varbitIndex);
      }
      if (taskWikiData.skills) {
        task.skills = taskWikiData.skills;
      }
      if (taskWikiData.notes) {
        task.wikiNotes = taskWikiData.notes;
      }
      if (taskWikiData.completionPercent) {
        task.completionPercent = taskWikiData.completionPercent;
      }
    }

    return tasks;
  }

  private async extractWikiData(wikiUrl: string, taskIdAttribute: string): Promise<ITaskWikiData[]> {
    try {
      const response = await axios.get(wikiUrl);
      const html = response.data;

      // Load the HTML with Cheerio
      const $ = cheerio.load(html);

      const result: ITaskWikiData[] = [];

      $(`tr[${taskIdAttribute}]`).each((_idx, element) => {
        const row = $(element);
        const cells = row.find('td');
        const varbitIndex = Number.parseInt(row.attr(taskIdAttribute));

        const requirementsCell = cells[REQUIREMENTS_COLUMN];

        // suffix coins image and amount with word "coins"
        const coins = $(requirementsCell).find('span.coins');
        if (coins) {
          const amountOfCoins = $(coins).text();
          $(coins).text(`${amountOfCoins} coins`);
        }

        // parse skills
        const scps = $(requirementsCell).find('span.scp');
        const skills = [];
        for (const scp of scps) {
          const skill = $(scp).attr('data-skill');
          const level = $(scp).attr('data-level');
          skills.push({
            skill: skill.toUpperCase(),
            level,
          });
        }
        let requirementsCellText = $(requirementsCell).text().trim();
        if (requirementsCellText === 'N/A') {
          requirementsCellText = undefined;
        }

        const completionCell = cells[COMPLETION_COLUMN];
        const completionPercent = Number.parseFloat($(completionCell).text().replace('%', ''));

        const taskData: ITaskWikiData = {
          varbitIndex,
          notes: requirementsCellText,
          completionPercent,
          skills: skills?.length > 0 ? skills : undefined,
        };
        result.push(taskData);
      });

      return result;
    } catch (error) {
      console.error('Error scraping the wiki page:', error);
      return [];
    }
  }
}
