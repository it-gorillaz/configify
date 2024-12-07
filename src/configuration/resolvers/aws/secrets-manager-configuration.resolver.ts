import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { ConfigurationResolver } from '../configuration-resolver.interface';
import { ResolvedValue } from '../resolved-value.interface';

/**
 * AWS Secrets Manager configuration resolver.
 */
export class AwsSecretsManagerConfigurationResolver
  implements ConfigurationResolver
{
  private readonly AWS_SECRETS_AMANGER_YAML_KEY = 'aws-secrets-manager';
  private readonly AWS_SECRETS_MANAGER_ENV_PREFIX = 'AWS_SECRETS_MANAGER';

  /**
   * Creates a new instance of secrets manager configuration resolver
   *
   * @param {SecretsManagerClient} secretsManager secrets manager client
   */
  constructor(private readonly secretsManager: SecretsManagerClient) {}

  /**
   * Fetches secrets and assign it to an object representation
   * of the configuration.
   *
   * @param   {Record<string, any>} config the configuration object
   * @returns {Record<string, any>}        the cofiguration with secret values assigned
   * @throws  {Error}                      if unable to fetch the secret
   */
  async resolve(config: Record<string, any>): Promise<Record<string, any>> {
    const secrets = this.filterConfiguration(config);
    const promises = this.buildBulkRequest(secrets);

    const results = await Promise.all(promises);

    const errors = results.filter((r) => !r.success);
    if (errors && errors.length) {
      throw new Error(
        `Unable to resolve secrets:\n${errors
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
   * Filters the configuration object by aws secrets manager keys.
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
          key.startsWith(this.AWS_SECRETS_AMANGER_YAML_KEY) ||
          key.startsWith(this.AWS_SECRETS_MANAGER_ENV_PREFIX),
      ),
    );
  }

  /**
   * Resolves secret values.
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
      const command = new GetSecretValueCommand({ SecretId: id });
      const response = await this.secretsManager.send(command);
      return {
        id,
        key,
        value: response.SecretString,
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
   * Creates a list of promises to get secret values.
   *
   * @param   {Record<string, any>}      config the configuration object
   * @returns {Promise<ResolvedValue>[]}        the get secret value promises
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
