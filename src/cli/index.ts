import { addStructCommand } from './commands/struct/add-struct-command';
import { CustomNestFactory } from './custom-nest-factory';
import { RootCommand } from './root-command';

export async function getCommandInstance<TModule>(
  command: any,
  module: TModule,
): Promise<any> {
  const app = await CustomNestFactory.createApplicationContext(module);
  return app.get(command);
}

const version = '0.0.1';

const program = new RootCommand()
  .name('task-scraper') //
  .description('CLI to perform task-scraper actions') //
  .version(version);

addStructCommand('struct', program);

(async () => {
  try {
    await program.parseAsync(process.argv);
  } catch (e) {
    console.error(e);
  }
})();

