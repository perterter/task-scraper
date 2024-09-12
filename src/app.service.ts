import { FileProvider, FlatCacheProvider, Struct } from '@abextm/cache2';
import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'path';

class NodeFSFileProvider implements FileProvider {
  public constructor(private path: string) {}

  public async getFile(name: string): Promise<Uint8Array | undefined> {
    return fs.readFile(path.join(this.path, name));
  }

  public exists(name: string): Promise<boolean> {
    return fs.access(path.join(this.path, name)).then(
      (_) => true,
      (_) => false,
    );
  }
}

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    const cacheProvider = new FlatCacheProvider(
      new NodeFSFileProvider('../../osrs-cache'),
    );
    console.log(cacheProvider);
    function replacer(key, value) {
      if (value instanceof Map) {
        const flat = {};
        for (const [k, v] of value.entries()) {
          flat[k] = v;
        }
        return flat;
      } else {
        return value;
      }
    }
    const z = await Struct.all(cacheProvider);
    const dat = z.filter((a) => !!a.params.get(873 as any));
    console.log(dat.length);
    return JSON.stringify(dat, replacer);
  }
}
