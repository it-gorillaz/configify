import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { ConfigurationResolver } from '../configuration-resolver.interface';
import { ResolvedValue } from '../resolved-value.interface';

export class GoogleCloudSecretManagerConfigurationResolver
  implements ConfigurationResolver
{
  private readonly GCP_SECRET_MANAGER_YAML_KEY = 'gcp-secret-manager';
  private readonly GCP_SECRET_MANAGER_ENV_PREFIX = 'GCP_SECRET_MANAGER';

  /**
   *
   * @param client
   */
  constructor(private readonly client: SecretManagerServiceClient) {}

  /**
   *
   * @param configuration
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
          key.startsWith(this.GCP_SECRET_MANAGER_YAML_KEY) ||
          key.startsWith(this.GCP_SECRET_MANAGER_ENV_PREFIX),
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
      const payload = { name: id };
      const [secret] = await this.client.accessSecretVersion(payload);
      return {
        id,
        key,
        value: secret.payload?.data?.toString(),
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
