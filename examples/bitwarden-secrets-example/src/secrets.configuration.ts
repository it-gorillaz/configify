import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class SecretsConfiguration {
  @Value('BITWARDEN_SECRETS_MANAGER_DB_PASSWORD')
  dbPassword: string;
}
