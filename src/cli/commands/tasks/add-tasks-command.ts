import { Command } from 'commander';
import { getCommandInstance } from '../..';
import { ArgumentValidator } from '../../../core/argument-validator';
import { RootCommand } from '../../root-command';
import { TasksCommand } from './tasks-command';
import { TasksCommandModule } from './tasks-command.module';

export function addTasksCommand(commandName: string, program: RootCommand): void {
  const combatTasks = new Command('combat')
    .option('--json', 'output to json file', false)
    .option('--legacy', 'outputs legacy task json format', false)
    .action(async (options: any) => {
      const command: TasksCommand = await getCommandInstance(TasksCommand, TasksCommandModule);
      await command.handleCombatTasks(options);
    });
  const combatCompare = new Command('combat-compare').action(async (options: any) => {
    const command: TasksCommand = await getCommandInstance(TasksCommand, TasksCommandModule);
    await command.handleCompareCombat();
  });

  const leagues4 = new Command('leagues4')
    .option('--json', 'output to json file', false)
    .option('--legacy', 'outputs legacy task json format', false)
    .action(async (options: any) => {
      const command: TasksCommand = await getCommandInstance(TasksCommand, TasksCommandModule);
      await command.handleLeagues4(options);
    });

  const extract = new Command('extract')
    .option('--task-name <taskName>', 'override prompt for the task name')
    .option('--id-param <idParam>', 'override prompt for the id', ArgumentValidator.isNumber)
    .option('--name-param <nameParam>', 'override prompt for the name', ArgumentValidator.isNumber)
    .option('--description-param <descriptionParam>', 'override prompt for the description', ArgumentValidator.isNumber)
    .option('--tier-param <tierParam>', 'override prompt for the tier', ArgumentValidator.isNumber)
    .option('--addl-params', 'override prompt for additional params')
    .action(async (options: any) => {
      const command: TasksCommand = await getCommandInstance(TasksCommand, TasksCommandModule);
      await command.interactiveTaskExtractionV2(options);
    });

  program
    .command(commandName)
    .description('data operations related to tasks')
    .addCommand(combatTasks)
    .addCommand(combatCompare)
    .addCommand(leagues4)
    .addCommand(extract);
}
