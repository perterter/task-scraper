import { Injectable } from '@nestjs/common';
import { CacheService } from '../../../core/services/cache.service';

@Injectable()
export class CacheCommand {
  constructor(private cacheService: CacheService) {}

  public async handleUpdate(): Promise<void> {
    return this.cacheService.updateCache();
  }
}

