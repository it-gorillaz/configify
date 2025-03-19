import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class SecretsConfiguration {
  @Value('CUSTOM_SECRET_DB_PASSWORD')
  dbPassword: string;
}
