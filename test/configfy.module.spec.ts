/* eslint-disable prettier/prettier */
import {
  secretsManagerSendMock,
  systemsManagerSendMock,
} from './mock/aws.mock';
import { ValueProvider } from '@nestjs/common';
import { resolve } from 'path';
import { ConfigfyModule } from '../src';
import { ComplexDotEnvConfiguration } from './config/complex-dot-env.configuration';
import { ComplexJsonConfiguration } from './config/complex-json.configuration';
import { ComplexYmlConfiguration } from './config/complex-yml.configuration';

describe('ConfigfyModule', () => {
  beforeEach(() => {
    secretsManagerSendMock.mockReset();
    systemsManagerSendMock.mockReset();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('forRootAsync()', () => {
    it('should provide complex .env configuration', async () => {
      const secret = 'test';

      secretsManagerSendMock.mockResolvedValue({ SecretString: secret });
      systemsManagerSendMock.mockResolvedValue({
        Parameter: { Value: secret },
      });

      const file = resolve(process.cwd(), 'test/config/.complex.env');
      const module = await ConfigfyModule.forRootAsync({
        configFilePath: file,
      });

      const provider = module.providers.filter(
        (p) =>
          (p as ValueProvider).useValue.constructor.name ===
          ComplexDotEnvConfiguration.name,
      )[0] as ValueProvider;

      expect(provider.useValue).toEqual({
        anyKey: 'ANY_VALUE',
        awsSecretsManagerTest: secret,
        awsParameterStoreTest: secret,
        expandedEnv: secret,
        jsonContent: {
          host: 'localhost',
        },
      });
    });

    it('should provide complex yml configuration', async () => {
      const secret = 'test';

      secretsManagerSendMock.mockResolvedValue({ SecretString: secret });
      systemsManagerSendMock.mockResolvedValue({
        Parameter: { Value: secret },
      });

      const file = resolve(process.cwd(), 'test/config/.complex.yml');
      const module = await ConfigfyModule.forRootAsync({
        configFilePath: file,
      });

      const provider = module.providers.filter(
        (p) =>
          (p as ValueProvider).useValue.constructor.name ===
          ComplexYmlConfiguration.name,
      )[0] as ValueProvider;

      expect(provider.useValue).toEqual({
        anyKey: 'any-value',
        awsSecretsManagerSecret: secret,
        awsParameterStoreSecret: secret,
        expandedEnv: secret,
        jsonContent: {
          host: 'localhost',
        },
      });
    });

    it('should provide complex json configuration', async () => {
      const secret = 'test';

      secretsManagerSendMock.mockResolvedValue({ SecretString: secret });
      systemsManagerSendMock.mockResolvedValue({
        Parameter: { Value: secret },
      });

      const file = resolve(process.cwd(), 'test/config/.complex.json');
      const module = await ConfigfyModule.forRootAsync({
        configFilePath: file,
      });

      const provider = module.providers.filter(
        (p) =>
          (p as ValueProvider).useValue.constructor.name ===
          ComplexJsonConfiguration.name,
      )[0] as ValueProvider;

      expect(provider.useValue).toEqual({
        anyKey: 'any-value',
        defaultValue: 'my-default-value',
        awsSecretsManagerSecret: secret,
        awsParameterStoreSecret: secret,
      });
    });
  });
});
