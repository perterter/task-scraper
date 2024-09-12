import { INestApplicationContext, NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

export let GLOBAL_NEST_OPTIONS: NestApplicationOptions = {};

export class CustomNestFactory {
  public static async createApplicationContext(moduleCls: any): Promise<INestApplicationContext> {
    return NestFactory.createApplicationContext(moduleCls, GLOBAL_NEST_OPTIONS);
  }
}
