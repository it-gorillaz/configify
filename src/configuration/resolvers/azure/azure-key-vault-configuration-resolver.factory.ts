import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { AzureKeyVaultConfigurationResolver } from './azure-key-vault-configuration.resolver';

/**
 * Factory for creating a default azure keyvault secrets resolver
 */
export class AzureKeyVaultConfigurationResolverFactory {
  /**
   * Creates a default azure keyvault secrets resolver
   * using the provided keyvault url or the AZURE_KEYVAULT_URL
   * environment variable.
   *
   * @param keyVaultUrl
   * @returns
   */
  static defaultKeyVaultConfigurationResolver(
    keyVaultUrl?: string,
  ): AzureKeyVaultConfigurationResolver {
    const url = keyVaultUrl || process.env.AZURE_KEY_VAULT_URL;

    if (!url) {
      throw new Error('Azure KeyVault URL is required');
    }

    return new AzureKeyVaultConfigurationResolver(
      new SecretClient(url, new DefaultAzureCredential()),
    );
  }
}
