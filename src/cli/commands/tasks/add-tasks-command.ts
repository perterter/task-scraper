import { Command } from 'commander';
import { getCommandInstance } from '../..';
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

  const leagues4 = new Command('leagues4').action(async () => {
    const command: TasksCommand = await getCommandInstance(TasksCommand, TasksCommandModule);
    await command.handleLeagues4();
  });

  const compare = new Command('compare').action(async () => {
    const command: TasksCommand = await getCommandInstance(TasksCommand, TasksCommandModule);
    await command.handleInteractiveCompare();
  });

  const extract = new Command('extract').action(async () => {
    const command: TasksCommand = await getCommandInstance(TasksCommand, TasksCommandModule);
    await command.interactiveTaskExtraction();
  });

  program
    .command(commandName)
    .description('data operations related to tasks')
    .addCommand(combatTasks)
    .addCommand(leagues4)
    .addCommand(compare)
    .addCommand(extract);
}
