import { BitwardenClient } from '@bitwarden/sdk-napi';
import { ConfigurationResolver } from '../configuration-resolver.interface';
import { ResolvedValue } from '../resolved-value.interface';

/**
 * Bitwarden Secrets Manager configuration resolver.
 */
export class BitwardenSecretsManagerConfigurationResolver
  implements ConfigurationResolver
{
  private readonly BITWARDEN_SECRETS_MANAGER_YAML_KEY =
    'bitwarden-secrets-manager';

  private readonly BITWARDEN_SECRETS_MANAGER_ENV_PREFIX =
    'BITWARDEN_SECRETS_MANAGER';

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
   * Fetches secrets and assign it to an object representation
   * of the configuration.
   *
   * @param   {Record<string, any>} config the configuration object
   * @returns {Record<string, any>}        the configuration with secret values assigned
   * @throws  {Error}                      if unable to fetch the secret
   */
  async resolve(config: Record<string, any>): Promise<Record<string, any>> {
    const parameters = this.filterConfiguration(config);
    const promises = this.buildBulkRequest(parameters);

    const results = await Promise.all(promises);

    const errors = results.filter((r) => !r.success);
    if (errors && errors.length) {
      throw new Error(
        `Unable to resolve parameter:\n${errors
          .map((e) => `${e.key}: ${e.id} - ${e.error?.message}`)
          .join('\n')}`,
      );
    }

    for (const result of results) {
      config[result.key] = result.value;
    }

    return config;
  }

  /**
   * Filters the configuration object by aws parameters store keys.
   *
   * @param   {Record<string, any>} config the configuration object
   * @returns {Record<string, any>}        the filtered object
   */
  private filterConfiguration(
    config: Record<string, any>,
  ): Record<string, any> {
    return Object.fromEntries(
      Object.entries(config).filter(
        ([key]) =>
          key.startsWith(this.BITWARDEN_SECRETS_MANAGER_YAML_KEY) ||
          key.startsWith(this.BITWARDEN_SECRETS_MANAGER_ENV_PREFIX),
      ),
    );
  }

  /**
   * Resolves parameter values.
   *
   * @param {string} key the object key
   * @param {string} id  the secret id
   * @returns
   */
  private async resolveSecretValue(
    key: string,
    id: string,
  ): Promise<ResolvedValue> {
    try {
      await this.client.auth().loginAccessToken(this.accessToken);
      const response = await this.client.secrets().get(id);
      return {
        id,
        key,
        value: response.value,
        success: true,
      };
    } catch (e) {
      return {
        id,
        key,
        error: e as Error,
        success: false,
      };
    }
  }

  /**
   * Creates a list of promises to get parameter values.
   *
   * @param   {Record<string, any>}      config the configuration object
   * @returns {Promise<ResolvedValue>[]}        the get parameter value promises
   */
  private buildBulkRequest(
    config: Record<string, any>,
  ): Promise<ResolvedValue>[] {
    const promises: Promise<ResolvedValue>[] = [];
    for (const [key, value] of Object.entries(config)) {
      promises.push(this.resolveSecretValue(key, value));
    }
    return promises;
  }
}
