import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { RemoteConfigurationResolverStrategy } from '../remote-configuration-resolver.strategy';

/**
 * AWS Parameter Store configuration resolver.
 */
export class AwsParameterStoreConfigurationResolver
  implements RemoteConfigurationResolverStrategy
{
  configurationKeys: readonly string[] = [
    'aws-parameter-store',
    'AWS_PARAMETER_STORE',
  ];

  /**
   * Creates a new instance of parameter store configuration resolver
   *
   * @param {SSMClient} ssm systems manager client
   */
  constructor(private readonly ssm: SSMClient) {}

  /**
   * Resolves the aws parameter store value.
   *
   * @param id the parameter id
   * @returns the parameter value
   */
  async resolveSecretValue(id: string): Promise<string | undefined> {
    const command = new GetParameterCommand({ Name: id, WithDecryption: true });
    const response = await this.ssm.send(command);
    return response.Parameter?.Value;
  }
}
