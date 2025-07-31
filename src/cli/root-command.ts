import { Command as CommanderCommand } from 'commander';
import { GLOBAL_NEST_OPTIONS } from './custom-nest-factory';

export class RootCommand extends CommanderCommand {
  constructor(name?: string) {
    super(name);
    if (name) {
      throw new Error(
        'name should not be specified for RootCommand. There should only be 1 RootCommand; try Command instead',
      );
    }
    this.addVerboseOption();
    this.addCommitOption();
    this.addVerbosePrehook();
  }

  private addVerboseOption() {
    this.option('-v, --verbose', 'enable verbose mode');
    return this;
  }

  private addCommitOption() {
    this.option('-c, --commit <hash>', 'use specific commit hash for cache operations (default: latest)');
    return this;
  }

  private addVerbosePrehook() {
    this.hook('preAction', (_thisCommand, _actionCommand) => {
      const options = this.opts();
      const infoLogging = options.verbose;
      if (!infoLogging) {
        console.info = (_a, ..._b) => {};
        GLOBAL_NEST_OPTIONS.logger = false;
      }
    });
  }
}
