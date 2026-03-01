import { Configuration, RequiredArgsConstructor, Value } from '../../src';

@Configuration()
@RequiredArgsConstructor()
export class ArgsConstructorConfiguration {
  @Value('TEST_ENV_ONE')
  testEnvOne: string;

  @Value('TEST_ENV_TWO')
  testEnvTwo: string;

  constructor(config: Required<ArgsConstructorConfiguration>) {
    this.testEnvOne = config.testEnvOne;
    this.testEnvTwo = config.testEnvTwo;
  }
}
