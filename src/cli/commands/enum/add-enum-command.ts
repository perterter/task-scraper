import { Command } from 'commander';
import { getCommandInstance } from '../..';
import { ArgumentValidator } from '../../../core/argument-validator';
import { RootCommand } from '../../root-command';
import { EnumCommand } from './enum-command';
import { EnumCommandModule } from './enum-command.module';

export function addEnumCommand(commandName: string, program: RootCommand): void {
  const get = new Command('get')
    .argument('<id>', 'enum id', ArgumentValidator.isNumber)
    .action(async (id: number, _options: any) => {
      const command: EnumCommand = await getCommandInstance(EnumCommand, EnumCommandModule);
      await command.handleGet(id);
    });

  program.command(commandName).description('data operations related to enums').addCommand(get);
}

