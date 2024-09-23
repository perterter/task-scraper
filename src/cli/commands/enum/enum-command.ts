import { Enum } from '@abextm/cache2';
import { Injectable } from '@nestjs/common';
import { replacer } from '../../../core/json-replacer';
import { EnumService } from '../../../core/services/enum/enum.service';

@Injectable()
export class EnumCommand {
  constructor(private enumService: EnumService) {}

  public async handleGet(id: number): Promise<void> {
    const theEnum: Enum = await this.enumService.getEnum(id);
    if (!theEnum) {
      console.error('undefined enum', { id });
      return;
    }
    console.log(theEnum);
  }

  public async handleFindString(searchString: string): Promise<void> {
    const structs: Enum[] = await this.enumService.findEnumsByString(searchString);
    console.log(JSON.stringify(structs, replacer, 2));
    console.log('total results', structs.length);
  }

  public async handleFindStruct(searchStructId: number): Promise<void> {
    const structs: Enum[] = await this.enumService.findEnumsByStruct(searchStructId);
    console.log(JSON.stringify(structs, replacer, 2));
    console.log('total results', structs.length);
  }
}

