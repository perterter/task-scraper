import { Command } from 'commander';
import { getCommandInstance } from '../..';
import { RootCommand } from '../../root-command';
import { CacheCommand } from './cache-command';
import { CacheCommandModule } from './cache-command.module';

export function addCacheCommand(commandName: string, program: RootCommand): void {
  const update = new Command('update').action(async (_options: any) => {
    const command: CacheCommand = await getCommandInstance(CacheCommand, CacheCommandModule);
    await command.handleUpdate();
  });

  program.command(commandName).description('operations related to the osrs cache').addCommand(update);
}

