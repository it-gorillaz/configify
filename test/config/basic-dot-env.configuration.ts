import { Configuration, Value } from '../../src';

@Configuration()
export class BasicDotEnvConfiguration {
  @Value('TEST_ENV_ONE')
  testEnvOne: string;

  @Value('TEST_ENV_TWO')
  testEnvTwo: string;
}
