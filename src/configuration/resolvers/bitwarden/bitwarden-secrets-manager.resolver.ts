import { BitwardenClient } from '@bitwarden/sdk-napi';
import { RemoteConfigurationResolverStrategy } from '../remote-configuration-resolver.strategy';

/**
 * Bitwarden Secrets Manager configuration resolver.
 */
export class BitwardenSecretsManagerConfigurationResolver
  implements RemoteConfigurationResolverStrategy
{
  configurationKeys: readonly string[] = [
    'bitwarden-secrets-manager',
    'BITWARDEN_SECRETS_MANAGER',
  ];

  /**
   * Creates a new instance of the configuration resolver
   * @param {BitwardenClient} bitwarden sdk client
   * @param {string} accessToken bitwarden access token
   */
  constructor(
    private readonly client: BitwardenClient,
    private readonly accessToken: string,
  ) {}

  /**
   * Resolves parameter values.
   *
   * @param {string} key the object key
   * @param {string} id  the secret id
   * @returns
   */
  async resolveSecretValue(id: string): Promise<string | undefined> {
    await this.client.auth().loginAccessToken(this.accessToken);
    const response = await this.client.secrets().get(id);
    return response.value;
  }
}
