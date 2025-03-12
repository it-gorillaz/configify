/* eslint-disable prettier/prettier */
import { secretsManagerSendMock } from '../mock/aws.mock';

import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { AwsSecretsManagerConfigurationResolver } from '../../src/configuration/resolvers/aws';

describe('AwsSecretsManagerConfigurationResolver', () => {
  beforeEach(() => {
    secretsManagerSendMock.mockReset();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('resolve()', () => {
    it('should throw error when unable to resolve secret', async () => {
      secretsManagerSendMock.mockRejectedValue(new Error('Secret not found'));

      const resolver = new AwsSecretsManagerConfigurationResolver(
        new SecretsManagerClient(),
      );

      await expect(
        resolver.resolve({
          AWS_SECRETS_MANAGER_CREDENTIALS: 'any/secret/id',
        }),
      ).rejects.toThrow(Error);
    });

    it('should resolve secret', async () => {
      const secret = 'test';
      secretsManagerSendMock.mockResolvedValue({ SecretString: secret });

      const resolver = new AwsSecretsManagerConfigurationResolver(
        new SecretsManagerClient(),
      );

      const config = await resolver.resolve({
        AWS_SECRETS_MANAGER_CREDENTIALS: 'any/secret/id',
      });

      expect(config).toEqual({ AWS_SECRETS_MANAGER_CREDENTIALS: secret });
    });
  });
});
