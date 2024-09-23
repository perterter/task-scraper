import { Test } from '@nestjs/testing';
import { CacheProviderModule } from '../../../core/cache-provider.module';
import { PARAM_ID } from '../../../core/data/param-ids';
import { EnumServiceModule } from '../../../core/services/enum/enum-service.module';
import { EnumService } from '../../../core/services/enum/enum.service';
import { StructServiceModule } from '../../../core/services/struct/struct-service.module';
import { StructService } from '../../../core/services/struct/struct.service';
import { TasksCommand } from './tasks-command';
import { TasksCommandModule } from './tasks-command.module';

describe(TasksCommand.name, () => {
  let structService: StructService;
  let enumService: EnumService;
  let command: TasksCommand;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [StructServiceModule, EnumServiceModule, CacheProviderModule, TasksCommandModule],
      providers: [StructService, EnumService],
    }).compile();

    structService = moduleRef.get<StructService>(StructService);
    enumService = moduleRef.get<EnumService>(EnumService);
    command = moduleRef.get<TasksCommand>(TasksCommand);
  });

  describe(TasksCommand.prototype.interactiveTaskExtractionV2, () => {
    it('should return combat tasks', async () => {
      const options = {
        taskName: 'barrows novice',
        idParam: PARAM_ID.CA_VARBIT_INDEX,
        nameParam: PARAM_ID.CA_NAME,
        descriptionParam: PARAM_ID.CA_DESCRIPTION,
        tierParam: PARAM_ID.CA_TIER_ID,
        addlParams: false,
        name: 'combat',
        description: 'combat achievements',
        taskJsonName: 'COMBAT',
      };
      await command.interactiveTaskExtractionV2(options);
    });
    it('should return league 4 tasks', async () => {
      const options = {
        taskName: 'enter sophanem',
        idParam: PARAM_ID.LEAGUE_VARBIT_INDEX,
        nameParam: PARAM_ID.LEAGUE_NAME,
        descriptionParam: PARAM_ID.LEAGUE_DESCRIPTION,
        tierParam: PARAM_ID.LEAGUE_TIER_ID,
        addlParams: false,
        name: 'league 4',
        description: 'leagues 4 tasks',
        taskJsonName: 'LEAGUE_4',
      };
      await command.interactiveTaskExtractionV2(options);
    });
  });
});
