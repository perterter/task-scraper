import { Enum } from '@abextm/cache2';
import { Injectable } from '@nestjs/common';
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
}

