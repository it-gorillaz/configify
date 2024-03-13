import { Configuration, Value } from '../../src';

@Configuration()
export class ComplexJsonConfiguration {
  @Value('nested.any-key')
  anyKey: string;

  @Value('default-value')
  defaultValue: string;

  @Value('expanded-secret')
  awsSecretsManagerSecret: string;

  @Value('aws-parameter-store.secret')
  awsParameterStoreSecret: string;
}
