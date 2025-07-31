import { FileProvider, FlatCacheProvider } from '@abextm/cache2';
import { Module } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'path';

@Module({
  exports: ['CacheProvider'],
  providers: [
    {
      provide: 'CacheProvider',
      useFactory: () => {
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

        const cacheProvider = new FlatCacheProvider(
          new NodeFSFileProvider('./osrs-cache'),
        );
        return cacheProvider;
      },
    },
  ],
})
export class CacheProviderModule {}

