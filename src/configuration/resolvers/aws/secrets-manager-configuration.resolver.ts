import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { RemoteConfigurationResolverStrategy } from '../remote-configuration-resolver.strategy';

/**
 * AWS Secrets Manager configuration resolver.
 */
export class AwsSecretsManagerConfigurationResolver
  implements RemoteConfigurationResolverStrategy
{
  configurationKeys: readonly string[] = [
    'aws-secrets-manager',
    'AWS_SECRETS_MANAGER',
  ];

  /**
   * Creates a new instance of secrets manager configuration resolver
   *
   * @param {SecretsManagerClient} secretsManager secrets manager client
   */
  constructor(private readonly secretsManager: SecretsManagerClient) {}

  /**
   * Resolves the secret value.
   *
   * @param {string} id  the secret id
   * @returns the secret value
   */
  async resolveSecretValue(id: string): Promise<string | undefined> {
    const command = new GetSecretValueCommand({ SecretId: id });
    const response = await this.secretsManager.send(command);
    return response.SecretString;
  }
}
