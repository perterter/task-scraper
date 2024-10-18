import { INestApplicationContext, NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CacheServiceModule } from '../core/services/cache-service.module';

export let GLOBAL_NEST_OPTIONS: NestApplicationOptions = {};

export class CustomNestFactory {
  public static async createApplicationContext(moduleCls: any): Promise<INestApplicationContext> {
    // Combine the incoming module with CacheServiceModule
    const combinedModule = {
      module: class AppModule {}, // Dummy root module
      imports: [moduleCls, CacheServiceModule], // Import both the incoming module and CacheServiceModule
    };
    return NestFactory.createApplicationContext(combinedModule, GLOBAL_NEST_OPTIONS);
  }
}
