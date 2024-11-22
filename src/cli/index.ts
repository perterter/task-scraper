import { CacheService } from '../core/services/cache/cache.service';
import { addCacheCommand } from './commands/cache/add-cache-command';
import { CacheCommand } from './commands/cache/cache-command';
import { addEnumCommand } from './commands/enum/add-enum-command';
import { addStructCommand } from './commands/struct/add-struct-command';
import { addTasksCommand } from './commands/tasks/add-tasks-command';
import { addWikiCommand } from './commands/wiki/add-wiki-command';
import { CustomNestFactory } from './custom-nest-factory';
import { RootCommand } from './root-command';

export async function getCommandInstance<TModule>(command: any, module: TModule): Promise<any> {
  const app = await CustomNestFactory.createApplicationContext(module);

  const cacheService = app.get(CacheService);
  const isUpToDate = await cacheService.isCacheUpToDate();
  if (!isUpToDate && command !== CacheCommand) {
    console.log('The cache is out of date. Update the cache by running: task-scraper cache update');
    process.exit(1);
  }
  return app.get(command);
}

const version = '0.0.1';

const program = new RootCommand()
  .name('task-scraper') //
  .description('CLI to perform task-scraper actions') //
  .version(version);

addStructCommand('struct', program);
addTasksCommand('tasks', program);
addEnumCommand('enum', program);
addCacheCommand('cache', program);
addWikiCommand('wiki', program);

(async () => {
  try {
    await program.parseAsync(process.argv);
  } catch (e) {
    console.error(e);
  }
})();

