import { Configuration, Value } from '../../src';

export interface DotEnvJsonContent {
  host: string;
}

@Configuration()
export class ComplexDotEnvConfiguration {
  @Value('ANY_KEY')
  anyKey: string;

  @Value('EXPANDED_ENV')
  expandedEnv: string;

  @Value('NUMBER_CONTENT', { parse: parseInt })
  numberContent: number;

  @Value('BOOLEAN_CONTENT', { parse: (value: any) => !!value })
  booleanContent: boolean;

  @Value('JSON_CONTENT', { parse: (value: any) => JSON.parse(value) })
  jsonContent: DotEnvJsonContent;

  @Value('NON_EXISTING_ENV', { default: 'test_default_value' })
  defaultValue: string;

  @Value('NON_EXISTING_ENV', { parse: parseInt, default: '1' })
  parsedDefaultValue: number;
}
