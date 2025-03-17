import { ConfigurationResolver } from './configuration-resolver.interface';
import { RemoteConfigurationResolverStrategy } from './remote-configuration-resolver.strategy';
import { ResolvedValue } from './resolved-value.interface';

/**
 * The remote configuration resolver.
 * This class resolves configuration values from a remote source.
 */
export class RemoteConfigurationResolver implements ConfigurationResolver {
  /**
   * Creates a new instance of RemoteConfigurationResolver.
   *
   * @param strategy the remote configuration resolver strategy
   */
  constructor(private readonly strategy: RemoteConfigurationResolverStrategy) {}

  /**
   * Resolves the configuration values.
   *
   * @param configuration the configuration object
   * @returns the resolved configuration object
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
   * Resolves the secret value.
   *
   * @param {string} key the object key
   * @param {string} id  the secret id
   * @returns the resolved value
   */
  private async resolveSecretValue(
    key: string,
    id: string,
  ): Promise<ResolvedValue> {
    try {
      const secret = await this.strategy.resolveSecretValue(id);
      return {
        id,
        key,
        value: secret,
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
   * Filters the configuration keys that can be resolved by the provided strategy.
   *
   * @param   {Record<string, any>} config the configuration object
   * @returns {Record<string, any>}        the filtered object
   */
  private filterConfiguration(
    config: Record<string, any>,
  ): Record<string, any> {
    const entries = Object.entries(config).filter(([key]) =>
      this.strategy.configurationKeys.some((k) => key.startsWith(k)),
    );
    return Object.fromEntries(entries);
  }

  /**
   * Creates a list of promises to resolve the configuration values.
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
