import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { SSMClient } from '@aws-sdk/client-ssm';
import { ConfigurationResolver } from '../configuration-resolver.interface';
import { AwsParameterStoreConfigurationResolver } from './parameter-store-configuration.resolver';
import { AwsSecretsManagerConfigurationResolver } from './secrets-manager-configuration.resolver';

/**
 * The AWS secrets resolver factory.
 * This class provides the default secrets resolvers for the module.
 * The default secrets resolvers are:
 * - Parameter Store
 * - Secrets Manager
 */
export class AwsSecretsResolverFactory {
  /**
   * The default parameter store secrets resolver
   * @returns {ConfigurationResolver} the default parameter store secrets resolver
   */
  static defaultParameterStoreResolver(): ConfigurationResolver {
    return new AwsParameterStoreConfigurationResolver(new SSMClient());
  }

  /**
   * The default secrets manager secrets resolver
   * @returns {ConfigurationResolver} the default secrets manager secrets resolver
   */
  static defaultSecretsManagerResolver(): ConfigurationResolver {
    return new AwsSecretsManagerConfigurationResolver(
      new SecretsManagerClient(),
    );
  }
}
