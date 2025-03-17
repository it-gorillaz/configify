import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { RemoteConfigurationResolverStrategy } from '../remote-configuration-resolver.strategy';

/**
 * Google Cloud Secret Manager Configuration Resolver.
 */
export class GoogleCloudSecretManagerConfigurationResolver
  implements RemoteConfigurationResolverStrategy
{
  configurationKeys: readonly string[] = [
    'gcp-secret-manager',
    'GCP_SECRET_MANAGER',
  ];

  /**
   * Creates a new instance of the gcp secret manager resolver
   *
   * @param {SecretManagerServiceClient} client the sdk client
   */
  constructor(private readonly client: SecretManagerServiceClient) {}

  /**
   * Resolves the secret value.
   *
   * @param {string} id the secret id
   * @returns the secret value
   */
  async resolveSecretValue(id: string): Promise<string | undefined> {
    const [secret] = await this.client.accessSecretVersion({ name: id });
    return secret.payload?.data?.toString();
  }
}
