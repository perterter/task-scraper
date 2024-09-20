import { CacheProvider, Enum } from '@abextm/cache2';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class EnumService {
  constructor(@Inject('CacheProvider') private readonly cacheProvider: CacheProvider) {}

  public getEnum(id: number): Promise<Enum> {
    console.info('getEnum', id);
    return Enum.load(this.cacheProvider, id);
  }
}

