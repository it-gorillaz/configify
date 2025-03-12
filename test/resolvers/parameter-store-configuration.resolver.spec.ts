/* eslint-disable prettier/prettier */
import { systemsManagerSendMock } from '../mock/aws.mock';

import { SSMClient } from '@aws-sdk/client-ssm';
import { AwsParameterStoreConfigurationResolver } from '../../src/configuration/resolvers/aws';

describe('AwsParameterStoreConfigurationResolver', () => {
  beforeEach(() => {
    systemsManagerSendMock.mockReset();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('resolve()', () => {
    it('should throw error when unable to resolve parameter', async () => {
      systemsManagerSendMock.mockRejectedValue(
        new Error('Parameter not found'),
      );

      const resolver = new AwsParameterStoreConfigurationResolver(
        new SSMClient(),
      );

      await expect(
        resolver.resolve({
          AWS_PARAMETER_STORE_CREDENTIALS: 'any/secret/id',
        }),
      ).rejects.toThrow(Error);
    });

    it('should resolve parameter', async () => {
      const secret = 'test';
      systemsManagerSendMock.mockResolvedValue({
        Parameter: { Value: secret },
      });

      const resolver = new AwsParameterStoreConfigurationResolver(
        new SSMClient(),
      );

      const config = await resolver.resolve({
        AWS_PARAMETER_STORE_CREDENTIALS: 'any/secret/id',
        'aws-parameter-store.secret': 'any/secret/id',
      });

      expect(config).toEqual({
        AWS_PARAMETER_STORE_CREDENTIALS: secret,
        'aws-parameter-store.secret': secret,
      });
    });
  });
});
