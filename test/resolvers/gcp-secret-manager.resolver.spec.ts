/* eslint-disable prettier/prettier */
import {
  accessSecretVersionMock,
  secretManagerServiceClientMock,
} from '../mock/gcp.mock';

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { RemoteConfigurationResolver } from '../../src';
import {
  GoogleCloudSecretManagerConfigurationResolver,
  GoogleCloudSecretsResolverFactory,
} from '../../src/configuration/resolvers/gcp';

describe('GoogleCloudSecretManagerConfigurationResolver', () => {
  beforeEach(() => {
    accessSecretVersionMock.mockReset();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('resolve()', () => {
    it('should throw error when unable to fetch the secret', async () => {
      const config = {
        GCP_SECRET_MANAGER_DB_PWD:
          'projects/123/secrets/test-gcp-secret/versions/latest',
      };

      accessSecretVersionMock.mockRejectedValue(
        new Error('Unable to fetch the secret'),
      );

      const resolver = new RemoteConfigurationResolver(
        new GoogleCloudSecretManagerConfigurationResolver(
          secretManagerServiceClientMock,
        ),
      );

      await expect(resolver.resolve(config)).rejects.toThrow(Error);

      expect(accessSecretVersionMock).toHaveBeenCalledTimes(1);
      expect(accessSecretVersionMock).toHaveBeenCalledWith({
        name: config.GCP_SECRET_MANAGER_DB_PWD,
      });
    });

    it('should resolve the secret', async () => {
      const secret = 'projects/123/secrets/test-gcp-secret/versions/latest';
      const config = {
        GCP_SECRET_MANAGER_DB_PWD: secret,
      };

      accessSecretVersionMock.mockResolvedValue([
        { payload: { data: Buffer.from('test-secret') } },
      ]);

      const resolver = new RemoteConfigurationResolver(
        new GoogleCloudSecretManagerConfigurationResolver(
          secretManagerServiceClientMock,
        ),
      );

      const result = await resolver.resolve(config);

      expect(result).toEqual({
        GCP_SECRET_MANAGER_DB_PWD: 'test-secret',
      });

      expect(accessSecretVersionMock).toHaveBeenCalledTimes(1);
      expect(accessSecretVersionMock).toHaveBeenCalledWith({
        name: secret,
      });
    });

    it('should create an instance of GoogleCloudSecretManagerConfigurationResolver', async () => {
      const resolver =
        GoogleCloudSecretsResolverFactory.defaultSecretManagerConfigurationResolver();

      expect(resolver).toBeInstanceOf(RemoteConfigurationResolver);
      expect(SecretManagerServiceClient).toHaveBeenCalledTimes(1);
    });
  });
});
