import { Command } from 'commander';
import { getCommandInstance } from '../..';
import { RootCommand } from '../../root-command';
import { CacheCommand } from './cache-command';
import { CacheCommandModule } from './cache-command.module';

export function addCacheCommand(commandName: string, program: RootCommand): void {
  const update = new Command('update')
    .action(async () => {
      const globalOptions = program.opts();
      const command: CacheCommand = await getCommandInstance(CacheCommand, CacheCommandModule);
      await command.handleUpdate(globalOptions.commit);
    });

  const status = new Command('status')
    .action(async () => {
      const command: CacheCommand = await getCommandInstance(CacheCommand, CacheCommandModule);
      await command.handleStatus();
    });

  program.command(commandName)
    .description('operations related to the osrs cache')
    .addCommand(update)
    .addCommand(status);
}

