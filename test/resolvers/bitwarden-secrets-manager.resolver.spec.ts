/* eslint-disable prettier/prettier */
import {
  bitwardenClientMock,
  bitwardenLoginAccessTokenMock,
  bitwardenSecretsClientGetMock,
} from '../mock/bitwarden.mock';

import { BitwardenClient } from '@bitwarden/sdk-napi';
import { RemoteConfigurationResolver } from '../../src';
import {
  BitwardenSecretsManagerConfigurationResolver,
  BitwardenSecretsResolverFactory,
  BitwardenServerRegion,
} from '../../src/configuration/resolvers/bitwarden';

describe('BitwardenSecretsManagerConfigurationResolver', () => {
  const testAccessToken = 'test-access-token';

  beforeEach(() => {
    bitwardenLoginAccessTokenMock.mockReset();
    bitwardenSecretsClientGetMock.mockReset();
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('resolve()', () => {
    it('should throw error when unable to authenticate', async () => {
      bitwardenLoginAccessTokenMock.mockRejectedValue(
        new Error('Unable to Authenticate'),
      );

      const resolver = new RemoteConfigurationResolver(
        new BitwardenSecretsManagerConfigurationResolver(
          bitwardenClientMock,
          testAccessToken,
        ),
      );

      await expect(
        resolver.resolve({
          BITWARDEN_SECRETS_MANAGER_DB_PWD: 'any-uuid',
        }),
      ).rejects.toThrow(Error);

      expect(bitwardenSecretsClientGetMock).not.toHaveBeenCalled();
      expect(bitwardenLoginAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(bitwardenLoginAccessTokenMock).toHaveBeenCalledWith(
        testAccessToken,
      );
    });

    it('should throw error when secret is not found', async () => {
      bitwardenLoginAccessTokenMock.mockResolvedValue({});
      bitwardenSecretsClientGetMock.mockRejectedValue(
        new Error('Secret ID not found'),
      );

      const resolver = new RemoteConfigurationResolver(
        new BitwardenSecretsManagerConfigurationResolver(
          bitwardenClientMock,
          testAccessToken,
        ),
      );

      await expect(
        resolver.resolve({
          BITWARDEN_SECRETS_MANAGER_DB_PWD: 'any-uuid',
        }),
      ).rejects.toThrow(Error);

      expect(bitwardenSecretsClientGetMock).toHaveBeenCalledTimes(1);
      expect(bitwardenSecretsClientGetMock).toHaveBeenCalledWith('any-uuid');
      expect(bitwardenLoginAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(bitwardenLoginAccessTokenMock).toHaveBeenCalledWith(
        testAccessToken,
      );
    });

    it('should resolve the secret', async () => {
      bitwardenLoginAccessTokenMock.mockResolvedValue({});
      bitwardenSecretsClientGetMock.mockResolvedValue({
        value: 'test-secret',
      });

      const resolver = new RemoteConfigurationResolver(
        new BitwardenSecretsManagerConfigurationResolver(
          bitwardenClientMock,
          testAccessToken,
        ),
      );

      const result = await resolver.resolve({
        BITWARDEN_SECRETS_MANAGER_DB_PWD: 'any-uuid',
      });

      expect(result).toMatchObject({
        BITWARDEN_SECRETS_MANAGER_DB_PWD: 'test-secret',
      });

      expect(bitwardenSecretsClientGetMock).toHaveBeenCalledTimes(1);
      expect(bitwardenSecretsClientGetMock).toHaveBeenCalledWith('any-uuid');
      expect(bitwardenLoginAccessTokenMock).toHaveBeenCalledTimes(1);
      expect(bitwardenLoginAccessTokenMock).toHaveBeenCalledWith(
        testAccessToken,
      );
    });

    it('should create an EU default instance of BitwardenSecretsManagerConfigurationResolver', async () => {
      const resolver =
        BitwardenSecretsResolverFactory.defaultBitwardenSecretsResolver(
          BitwardenServerRegion.EU,
          'test-access-token',
        );

      expect(resolver).toBeInstanceOf(RemoteConfigurationResolver);

      expect(BitwardenClient).toHaveBeenCalledWith({
        apiUrl: 'https://api.bitwarden.eu',
        identityUrl: 'https://identity.bitwarden.eu',
        userAgent: 'Bitwarden SDK',
        deviceType: 'SDK',
      });
    });

    it('should create an US default instance of BitwardenSecretsManagerConfigurationResolver', async () => {
      const resolver =
        BitwardenSecretsResolverFactory.defaultBitwardenSecretsResolver(
          BitwardenServerRegion.US,
          'test-access-token',
        );

      expect(resolver).toBeInstanceOf(RemoteConfigurationResolver);

      expect(BitwardenClient).toHaveBeenCalledWith({
        apiUrl: 'https://api.bitwarden.com',
        identityUrl: 'https://identity.bitwarden.com',
        userAgent: 'Bitwarden SDK',
        deviceType: 'SDK',
      });
    });
  });
});
