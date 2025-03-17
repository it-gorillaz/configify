import { SecretClient } from '@azure/keyvault-secrets';
import { RemoteConfigurationResolverStrategy } from '../remote-configuration-resolver.strategy';

/**
 * Azure Key Vault Secrets Configuration Resolver.
 */
export class AzureKeyVaultConfigurationResolver
  implements RemoteConfigurationResolverStrategy
{
  configurationKeys: readonly string[] = ['azure-key-vault', 'AZURE_KEY_VAULT'];

  /**
   * Creates a new instance of the Azure key vault secrets resolver
   *
   * @param client the sdk client
   */
  constructor(private readonly client: SecretClient) {}

  /**
   * Resolves the secret value.
   *
   * @param {string} id  the secret id
   * @returns the secret value
   */
  async resolveSecretValue(id: string): Promise<string | undefined> {
    const secret = await this.client.getSecret(id);
    return secret.value;
  }
}
