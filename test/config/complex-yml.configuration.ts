import { Configuration, Value } from '../../src';

export interface YmlJsonContent {
  host: string;
}

@Configuration()
export class ComplexYmlConfiguration {
  @Value('any-key')
  anyKey: string;

  @Value('aws-secrets-manager.secret')
  awsSecretsManagerSecret: string;

  @Value('aws-parameter-store.secret')
  awsParameterStoreSecret: string;

  @Value('bitwarden-secrets-manager.secret')
  bitwardenSecretsManagerSecret: string;

  @Value('gcp-secret-manager.secret')
  gcpSecretManagerSecret: string;

  @Value('azure-key-vault.secret')
  azureKeyVaultSecret: string;

  @Value('expanded-key')
  expandedEnv: string;

  @Value('number-content', { parse: parseInt })
  numberContent: number;

  @Value('boolean-content', { parse: (value: string) => value === 'true' })
  booleanContent: boolean;

  @Value('json-content', { parse: JSON.parse })
  jsonContent: YmlJsonContent;

  @Value('non-existing-key', { default: 'test_default_value' })
  defaultValue: string;

  @Value('non-existing-key', { parse: parseInt, default: 1 })
  parsedDefaultValue: number;

  @Value('non-existing-key', {
    parse: (value: string) => value === 'true',
    default: true,
  })
  parsedDefaultBoolean: boolean;
}
