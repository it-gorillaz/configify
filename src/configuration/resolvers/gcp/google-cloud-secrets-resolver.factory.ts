import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { ConfigurationResolver } from '../configuration-resolver.interface';
import { RemoteConfigurationResolver } from '../remote-configuration.resolver';
import { GoogleCloudSecretManagerConfigurationResolver } from './google-cloud-secret-manager.resolver';

/**
 * GoogleCloudSecretsResolverFactory provides the default secrets resolvers for the module.
 */
export class GoogleCloudSecretsResolverFactory {
  /**
   * The default secret manager configuration resolver
   * @returns {GoogleCloudSecretManagerConfigurationResolver} the default secret manager configuration resolver
   */
  static defaultSecretManagerConfigurationResolver(): ConfigurationResolver {
    const strategy = new GoogleCloudSecretManagerConfigurationResolver(
      new SecretManagerServiceClient(),
    );
    return new RemoteConfigurationResolver(strategy);
  }
}
