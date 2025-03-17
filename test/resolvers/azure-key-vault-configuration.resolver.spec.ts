/* eslint-disable prettier/prettier */
import { getSecretMock, secretClientMock } from '../mock/azure.mock';

import { SecretClient } from '@azure/keyvault-secrets';
import { RemoteConfigurationResolver } from '../../src';
import {
  AzureKeyVaultConfigurationResolver,
  AzureKeyVaultConfigurationResolverFactory,
} from '../../src/configuration/resolvers/azure';

describe('AzureKeyVaultConfigurationResolver', () => {
  beforeEach(() => {
    getSecretMock.mockReset();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('resolve()', () => {
    it('should throw error when unable to fetch the secret', async () => {
      const config = {
        AZURE_KEY_VAULT_DB_PWD: 'test-secret-name',
      };

      getSecretMock.mockRejectedValue(new Error('Unable to fetch the secret'));

      const resolver = new RemoteConfigurationResolver(
        new AzureKeyVaultConfigurationResolver(secretClientMock),
      );

      await expect(resolver.resolve(config)).rejects.toThrow(Error);

      expect(getSecretMock).toHaveBeenCalledTimes(1);
      expect(getSecretMock).toHaveBeenCalledWith('test-secret-name');
    });

    it('should resolve the secret', async () => {
      const secret = 'test-secret-name';
      const config = {
        AZURE_KEY_VAULT_DB_PWD: secret,
      };

      getSecretMock.mockResolvedValue({ value: 'mySecretDBPassword' });

      const resolver = new RemoteConfigurationResolver(
        new AzureKeyVaultConfigurationResolver(secretClientMock),
      );

      const result = await resolver.resolve(config);

      expect(result).toEqual({
        AZURE_KEY_VAULT_DB_PWD: 'mySecretDBPassword',
      });

      expect(getSecretMock).toHaveBeenCalledTimes(1);
      expect(getSecretMock).toHaveBeenCalledWith('test-secret-name');
    });

    it('should create an instance of AzureKeyVaultConfigurationResolver', async () => {
      const resolver =
        AzureKeyVaultConfigurationResolverFactory.defaultKeyVaultConfigurationResolver(
          'test-url',
        );

      expect(resolver).toBeInstanceOf(RemoteConfigurationResolver);
      expect(SecretClient).toHaveBeenCalledTimes(1);
    });
  });
});
