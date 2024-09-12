import { Test, TestingModule } from '@nestjs/testing';
import { StructService } from './struct.service';

describe('StructService', () => {
  let service: StructService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StructService],
    }).compile();

    service = module.get<StructService>(StructService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

