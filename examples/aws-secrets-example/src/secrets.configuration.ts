import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class SecretsConfiguration {
  @Value('AWS_PARAMETER_STORE_DB_PASSWORD')
  myDbParameterStoreSecret: string;

  @Value('AWS_SECRETS_MANAGER_DB_PASSWORD')
  myDbSsmSecret: string;
}
