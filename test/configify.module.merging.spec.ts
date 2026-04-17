import { DynamicModule, ValueProvider } from '@nestjs/common';
import { resolve } from 'path';
import { ConfigifyModule, ConfigifyModuleOptions } from '../src';
import { ArgsConstructorConfiguration } from './config/args-constructor.configuration';

jest.mock('../src/configuration', () => ({
  ...jest.requireActual('../src/configuration'),
  DefaultConfigifyModuleOptions: {
    ignoreConfigFile: false,
  } as ConfigifyModuleOptions,
}));

describe('ConfigifyModule', () => {
  const findFirstValueProvider = (
    module: DynamicModule,
    className: string,
  ): ValueProvider => {
    return module.providers?.filter(
      (p) => (p as ValueProvider).useValue.constructor.name === className,
    )[0] as ValueProvider;
  };

  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('forRootAsync() options merging', () => {
    it('should give precedence to provided options over defaults', async () => {
      const file = resolve(process.cwd(), 'test/config/.basic.env');
      const module = await ConfigifyModule.forRootAsync({
        configFilePath: file,
        ignoreConfigFile: true,
      });

      const provider = findFirstValueProvider(
        module,
        ArgsConstructorConfiguration.name,
      );

      expect(provider.useValue).toEqual(
        expect.not.objectContaining({
          testEnvOne: 'ANY_VALUE_ONE',
          testEnvTwo: 'ANY_VALUE_TWO',
        }),
      );
    });
  });

  describe('forRootAsync() variables merging', () => {
    it('should give precedence to env vars over config file vars', async () => {
      process.env.TEST_ENV_ONE = 'FROM_ENV';

      const file = resolve(process.cwd(), 'test/config/.basic.env');
      const module = await ConfigifyModule.forRootAsync({
        configFilePath: file,
      });

      const provider = findFirstValueProvider(
        module,
        ArgsConstructorConfiguration.name,
      );

      expect(provider.useValue).toEqual(
        expect.objectContaining({
          testEnvOne: 'FROM_ENV', // env var overrides config file ('ANY_VALUE_ONE')
          testEnvTwo: 'ANY_VALUE_TWO', // from config file
        }),
      );
    });
  });
});
