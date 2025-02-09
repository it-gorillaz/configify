import { Configuration, Value } from '../../src';

@Configuration()
export class ComplexJsonConfiguration {
  @Value('nested.any-key')
  anyKey: string;

  @Value('default-value')
  defaultValue: string;

  @Value('number-content', { parse: parseInt })
  numberContent: number;

  @Value('boolean-content', { parse: (value: any) => !!value })
  booleanContent: boolean;

  @Value('non-existing-key', { default: true })
  defaultBoolean: boolean;

  @Value('non-existing-key', { parse: parseInt, default: '1' })
  parsedDefaultValue: number;
}
