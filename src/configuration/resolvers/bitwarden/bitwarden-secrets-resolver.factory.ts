import {
  BitwardenClient,
  ClientSettings,
  DeviceType,
} from '@bitwarden/sdk-napi';
import { BitwardenSecretsManagerConfigurationResolver } from './bitwarden-secrets-manager.resolver';
import { BitwardenServerRegion } from './bitwarden-server.region';

/**
 * Bitwarden Secrets Resolver Factory
 * This class provides a factory method to create a BitwardenSecretsManagerConfigurationResolver.
 */
export class BitwardenSecretsResolverFactory {
  /**
   * EU settings
   */
  private static readonly BITWARDEN_EU_SETTINGS: ClientSettings = {
    apiUrl: 'https://api.bitwarden.eu',
    identityUrl: 'https://identity.bitwarden.eu',
    userAgent: 'Bitwarden SDK',
    deviceType: DeviceType.SDK,
  };

  /**
   * US settings
   */
  private static readonly BITWARDEN_US_SETTINGS: ClientSettings = {
    apiUrl: 'https://api.bitwarden.com',
    identityUrl: 'https://identity.bitwarden.com',
    userAgent: 'Bitwarden SDK',
    deviceType: DeviceType.SDK,
  };

  /**
   * Creates a default instance of the BitwardenSecretsManagerConfigurationResolver.
   * If no access token is provided, it will attempt to use the BWS_ACCESS_TOKEN environment variable.
   *
   * @param {BitwardenServerRegion} region the Bitwarden server region
   * @param {string} accessToken the Bitwarden access token
   * @returns {BitwardenSecretsManagerConfigurationResolver} the BitwardenSecretsManagerConfigurationResolver instance
   */
  static defaultBitwardenSecretsResolver(
    region: BitwardenServerRegion,
    accessToken?: string,
  ): BitwardenSecretsManagerConfigurationResolver {
    const token = accessToken || process.env.BWS_ACCESS_TOKEN;

    if (!token) {
      throw new Error('No Bitwarden access token provided');
    }

    const settings =
      BitwardenServerRegion.EU === region
        ? this.BITWARDEN_EU_SETTINGS
        : this.BITWARDEN_US_SETTINGS;

    const client = new BitwardenClient(settings);

    return new BitwardenSecretsManagerConfigurationResolver(client, token);
  }
}
