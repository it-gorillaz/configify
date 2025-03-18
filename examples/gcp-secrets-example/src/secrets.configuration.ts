import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class SecretsConfiguration {
  @Value('GCP_SECRET_MANAGER_DB_PASSWORD')
  dbPassword: string;
}
