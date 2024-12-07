import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { ConfigurationResolver } from '../configuration-resolver.interface';
import { ResolvedValue } from '../resolved-value.interface';

/**
 * AWS Parameter Store configuration resolver.
 */
export class AwsParameterStoreConfigurationResolver
  implements ConfigurationResolver
{
  private readonly AWS_PARAMETER_STORE_YAML_KEY = 'aws-parameter-store';
  private readonly AWS_PARAMETER_STORE_ENV_PREFIX = 'AWS_PARAMETER_STORE';

  /**
   * Creates a new instance of parameter store configuration resolver
   *
   * @param {SSMClient} ssm systems manager client
   */
  constructor(private readonly ssm: SSMClient) {}

  /**
   * Fetches parameters and assign it to an object representation
   * of the configuration.
   *
   * @param   {Record<string, any>} config the configuration object
   * @returns {Record<string, any>}        the cofiguration with secret values assigned
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
          key.startsWith(this.AWS_PARAMETER_STORE_YAML_KEY) ||
          key.startsWith(this.AWS_PARAMETER_STORE_ENV_PREFIX),
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
      const payload = { Name: id, WithDecryption: true };
      const command = new GetParameterCommand(payload);
      const response = await this.ssm.send(command);
      return {
        id,
        key,
        value: response.Parameter?.Value,
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
