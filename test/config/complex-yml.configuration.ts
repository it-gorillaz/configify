import { Configuration, Value } from '../../src';

export interface YmlJsonContent {
  host: string;
}

@Configuration()
export class ComplexYmlConfiguration {
  @Value('any-key')
  anyKey: string;

  @Value('expanded-key')
  expandedEnv: string;

  @Value('number-content', { parse: parseInt })
  numberContent: number;

  @Value('boolean-content', { parse: (value: any) => !!value })
  booleanContent: boolean;

  @Value('json-content', {
    parse: (value: any) => JSON.parse(value),
  })
  jsonContent: YmlJsonContent;

  @Value('non-existing-key', { default: 'test_default_value' })
  defaultValue: string;

  @Value('non-existing-key', { parse: parseInt, default: '1' })
  parsedDefaultValue: number;
}
