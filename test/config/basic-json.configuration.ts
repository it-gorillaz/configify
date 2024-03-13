import { Configuration, Value } from '../../src';

@Configuration()
export class BasicJsonConfiguration {
  @Value('any-key-one')
  anyKeyOne: string;

  @Value('any-key-two')
  anyKeyTwo: string;
}
