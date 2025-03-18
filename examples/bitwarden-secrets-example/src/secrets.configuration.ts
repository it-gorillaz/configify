import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class SecretsConfiguration {
  @Value('AZURE_KEY_VAULT_DB_PASSWORD')
  dbPassword: string;
}
