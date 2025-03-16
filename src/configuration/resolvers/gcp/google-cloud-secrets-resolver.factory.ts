import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { GoogleCloudSecretManagerConfigurationResolver } from './google-cloud-secret-manager.resolver';

/**
 * GoogleCloudSecretsResolverFactory provides the default secrets resolvers for the module.
 */
export class GoogleCloudSecretsResolverFactory {
  /**
   * The default secret manager configuration resolver
   * @returns {GoogleCloudSecretManagerConfigurationResolver} the default secret manager configuration resolver
   */
  static defaultSecretManagerConfigurationResolver(): GoogleCloudSecretManagerConfigurationResolver {
    return new GoogleCloudSecretManagerConfigurationResolver(
      new SecretManagerServiceClient(),
    );
  }
}
