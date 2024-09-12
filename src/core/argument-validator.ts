import { InvalidArgumentError } from 'commander';

export class ArgumentValidator {
  public static isNumber(value: string, _dummyPrevious): number {
    // parseInt takes a string and a radix
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new InvalidArgumentError('Not a number.');
    }
    return parsedValue;
  }

  public static isNumberOrString(
    value: string,
    _dummyPrevious,
  ): number | string {
    // parseInt takes a string and a radix
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      return value;
    }
    return parsedValue;
  }
}
