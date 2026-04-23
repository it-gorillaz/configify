/* eslint-disable prettier/prettier */
import {
  secretsManagerSendMock,
  systemsManagerSendMock,
} from './mock/aws.mock';

import { DynamicModule, ValueProvider } from '@nestjs/common';
import { resolve } from 'path';
import { ConfigifyModule } from '../src';
import { AwsSecretsResolverFactory } from '../src/configuration/resolvers/aws';
import { ArgsConstructorConfiguration } from './config/args-constructor.configuration';
import { ComplexDotEnvConfiguration } from './config/complex-dot-env.configuration';
import { ComplexJsonConfiguration } from './config/complex-json.configuration';
import { ComplexYmlConfiguration } from './config/complex-yml.configuration';

describe('ConfigifyModule', () => {
  const findFirstValueProvider = (
    module: DynamicModule,
    className: string,
  ): ValueProvider => {
    return module.providers?.filter(
      (p) => (p as ValueProvider).useValue.constructor.name === className,
    )[0] as ValueProvider;
  };

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
      systemsManagerSendMock.mockResolvedValue({ Parameter: { Value: secret } });

      const file = resolve(process.cwd(), 'test/config/.complex.env');
      const module = await ConfigifyModule.forRootAsync({
        configFilePath: file,
        secretsResolverStrategies: [
          AwsSecretsResolverFactory.defaultParameterStoreResolver(),
          AwsSecretsResolverFactory.defaultSecretsManagerResolver(),
        ],
      });

      const provider = findFirstValueProvider(module, ComplexDotEnvConfiguration.name);
      expect(provider.useValue).toEqual({
        anyKey: 'ANY_VALUE',
        awsSecretsManagerTest: secret,
        awsParameterStoreTest: secret,
        bitwardenSecretsManagerTest: 'test-secret-id',
        gcpSecretManagerTest: 'test-gcp-secret',
        azureKeyVaultTest: 'test-azure-secret',
        expandedEnv: secret,
        numberContent: 1234,
        booleanContent: true,
        jsonContent: { host: 'localhost' },
        defaultValue: 'test_default_value',
        parsedDefaultValue: 1,
      });
    });

    it('should provide complex yml configuration', async () => {
      const secret = 'test';
      secretsManagerSendMock.mockResolvedValue({ SecretString: secret });
      systemsManagerSendMock.mockResolvedValue({ Parameter: { Value: secret } });

      const file = resolve(process.cwd(), 'test/config/.complex.yml');
      const module = await ConfigifyModule.forRootAsync({
        configFilePath: file,
        secretsResolverStrategies: [
          AwsSecretsResolverFactory.defaultParameterStoreResolver(),
          AwsSecretsResolverFactory.defaultSecretsManagerResolver(),
        ],
      });

      const provider = findFirstValueProvider(module, ComplexYmlConfiguration.name);
      expect(provider.useValue).toEqual({
        anyKey: 'any-value',
        awsSecretsManagerSecret: secret,
        awsParameterStoreSecret: secret,
        bitwardenSecretsManagerSecret: 'test-secret-id',
        gcpSecretManagerSecret: 'test-gcp-secret',
        azureKeyVaultSecret: 'test-azure-secret',
        numberContent: 1234,
        booleanContent: true,
        expandedEnv: secret,
        jsonContent: { host: 'localhost' },
        defaultValue: 'test_default_value',
        parsedDefaultValue: 1,
      });
    });

    it('should provide complex json configuration', async () => {
      const secret = 'test';
      secretsManagerSendMock.mockResolvedValue({ SecretString: secret });
      systemsManagerSendMock.mockResolvedValue({ Parameter: { Value: secret } });

      const file = resolve(process.cwd(), 'test/config/.complex.json');
      const module = await ConfigifyModule.forRootAsync({
        configFilePath: file,
        secretsResolverStrategies: [
          AwsSecretsResolverFactory.defaultParameterStoreResolver(),
          AwsSecretsResolverFactory.defaultSecretsManagerResolver(),
        ],
      });

      const provider = findFirstValueProvider(module, ComplexJsonConfiguration.name);
      expect(provider.useValue).toEqual({
        anyKey: 'any-value',
        defaultValue: 'my-default-value',
        numberContent: 1234,
        booleanContent: true,
        awsSecretsManagerSecret: secret,
        awsParameterStoreSecret: secret,
        bitwardenSecretsManagerSecret: 'test-secret-id',
        gcpSecretManagerSecret: 'test-gcp-secret',
        azureKeyVaultSecret: 'test-azure-secret',
        defaultBoolean: true,
        parsedDefaultValue: 1,
      });
    });

    it('should provide configuration with constructor args injected', async () => {
      const file = resolve(process.cwd(), 'test/config/.basic.env');
      const module = await ConfigifyModule.forRootAsync({ configFilePath: file });

      const provider = findFirstValueProvider(module, ArgsConstructorConfiguration.name);
      expect(provider.useValue).toEqual({
        testEnvOne: 'ANY_VALUE_ONE',
        testEnvTwo: 'ANY_VALUE_TWO',
      });
    });
  });

  describe('forRootAsync() options and merging', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
      delete process.env.TEST_ENV_ONE;
      delete process.env.TEST_ENV_TWO;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should give precedence to provided options over defaults', async () => {
      const file = resolve(process.cwd(), 'test/config/.basic.env');
      const module = await ConfigifyModule.forRootAsync({
        configFilePath: file,
        ignoreConfigFile: true,
      });

      const provider = findFirstValueProvider(module, ArgsConstructorConfiguration.name);
      expect(provider.useValue).toEqual(
        expect.not.objectContaining({
          testEnvOne: 'ANY_VALUE_ONE',
          testEnvTwo: 'ANY_VALUE_TWO',
        }),
      );
    });

    it('should give precedence to env vars over config file values', async () => {
      process.env.TEST_ENV_ONE = 'FROM_ENV';

      const file = resolve(process.cwd(), 'test/config/.basic.env');
      const module = await ConfigifyModule.forRootAsync({ configFilePath: file });

      const provider = findFirstValueProvider(module, ArgsConstructorConfiguration.name);
      expect(provider.useValue).toEqual(
        expect.objectContaining({
          testEnvOne: 'FROM_ENV',
          testEnvTwo: 'ANY_VALUE_TWO',
        }),
      );
    });

    it('should ignore env vars when ignoreEnvVars is true', async () => {
      process.env.TEST_ENV_ONE = 'FROM_ENV';

      const file = resolve(process.cwd(), 'test/config/.basic.env');
      const module = await ConfigifyModule.forRootAsync({
        configFilePath: file,
        ignoreEnvVars: true,
      });

      const provider = findFirstValueProvider(module, ArgsConstructorConfiguration.name);
      expect(provider.useValue).toEqual(
        expect.objectContaining({ testEnvOne: 'ANY_VALUE_ONE' }),
      );
    });
  });
});
