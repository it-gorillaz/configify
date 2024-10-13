import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { SSMClient } from '@aws-sdk/client-ssm';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { validateSync } from 'class-validator';
import * as fs from 'fs';
import { resolve } from 'path';
import {
  AwsSecretsManagerConfigurationResolver,
  ConfigfyModuleOptions,
  ConfigurationParserFactory,
  ConfigurationProviders,
  ConfigurationRegistry,
  DefaultConfigfyModuleOptions,
} from './configuration';
import { AwsParameterStoreConfigurationResolver } from './configuration/resolvers/aws/parameter-store-configuration.resolver';
import { Variables } from './interpolation/variables';

/**
 * The configify module.
 * A NestJS configuration module on steroids.
 *
 * This module provides out of the box configuration files parsing,
 * remote secrets fetching, variables expansion and configuration validation.
 *
 * The lifecycle of the module consists of:
 * - Reading configuration files
 * - Resolving remote secrets
 * - Expanding variables
 * - Creating object instances decored with Configuration and assigning its values
 * - Validating the configuration instance
 *
 * All the configuration set to the configuration files will be assigned to the process.env object
 */
@Module({})
export class ConfigifyModule {
  /**
   * The default configuration files.
   * If no configuration files are provided this module will
   * lookup at a .env, application.yml and an application.json files
   * at the root path of the project.
   */
  private static readonly DEFAULT_CONFIG_FILES = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'application.yml'),
    resolve(process.cwd(), 'application.json'),
  ];

  /**
   * The remote secrets resolvers pipeline.
   * This module currently supports resolving secrets on
   * AWS Secrets Manager and AWS Parameters Store.
   */
  private static readonly SECRETS_RESOLVER_PIPELINE = [
    (options: ConfigfyModuleOptions) =>
      new AwsSecretsManagerConfigurationResolver(
        options.secretsManagerClient || new SecretsManagerClient(),
      ),

    (options: ConfigfyModuleOptions) =>
      new AwsParameterStoreConfigurationResolver(
        options.ssmClient || new SSMClient(),
      ),
  ];

  /**
   * Creates the configfy dynamic module.
   *
   * The module will manage the instance of all classes decorated the Configuration decorator,
   * meaning, the module will instanciate and associate the value to attributes according to the
   * keys provided by the Value decorator.
   *
   * The configuration key pair values will also be available on process.env object.
   *
   * @param   { ConfigfyModuleOptions } options The module config options
   * @returns { DynamicModule }         module  The configy module
   */
  static async forRootAsync(
    options: ConfigfyModuleOptions = {},
  ): Promise<DynamicModule> {
    const settings = { ...options, ...DefaultConfigfyModuleOptions };
    const files = this.resolveConfigurationFiles(settings.configFilePath);

    const envVars = settings.ignoreEnvVars ? {} : process.env;
    const fromFile = settings.ignoreConfigFile
      ? {}
      : this.parseConfigurationFiles(files);

    const container = { ...envVars, ...fromFile };
    const secrets = await this.runSecretsResolverPipeline(container, settings);
    const configuration = { ...container, ...secrets };

    if (settings.expandConfig) {
      const expanded = Variables.expand(configuration);
      Object.assign(configuration, expanded);
    }

    Object.assign(process.env, configuration);

    const { exports, providers } = this.buildConfigurationProviders();

    return {
      exports,
      providers,
      global: true,
      module: ConfigifyModule,
    };
  }

  /**
   * Runs the secrets resolver pipeline.
   *
   * @param   {Record<string, any>}            config the configuration object
   * @param   {ConfigfyModuleOptions}          options the module options
   * @returns {Promise<Record<string, any>>}   the resolved secrets
   */
  private static async runSecretsResolverPipeline(
    config: Record<string, any>,
    options: ConfigfyModuleOptions,
  ): Promise<Record<string, any>> {
    const secrets = {};
    for (const buildResolver of this.SECRETS_RESOLVER_PIPELINE) {
      const resolver = buildResolver(options);
      const result = await resolver.resolve(config);
      Object.assign(secrets, result);
    }
    return secrets;
  }

  /**
   * Creates the configuration module providers.
   * It creates the configuration instances, assign its value
   * and perform the object validation.
   *
   * @returns {ConfigurationProviders} the module configuration providers
   */
  private static buildConfigurationProviders(): ConfigurationProviders {
    const exports = [];
    const providers: Provider[] = [];

    const registry = ConfigurationRegistry.getRegistry();
    for (const ConfigType of registry) {
      const instance = new ConfigType();

      const attributes =
        ConfigurationRegistry.getValueDecoratedAttributes(instance);

      for (const attribute of attributes) {
        const metadata = ConfigurationRegistry.getValueDecoratedKey(
          instance,
          attribute,
        );

        const parse = metadata.options?.parse;
        const value = parse
          ? parse(process.env[metadata.key])
          : process.env[metadata.key];

        instance[attribute] = value;
      }

      const errors = validateSync(instance);
      if (errors && errors.length) {
        throw new Error(
          `validation constraints violated:\n${errors
            .map((e) =>
              JSON.stringify(
                { attribute: e.property, constraints: e.constraints },
                null,
                2,
              ),
            )
            .join('\n')}`,
        );
      }

      exports.push(ConfigType);
      providers.push({ provide: ConfigType, useValue: instance });
    }

    return { exports, providers };
  }

  /**
   * Flattens a nested object into an one level key value pair object
   *
   * @param {object}              source the source object
   * @param {string[]}            path   the key path
   * @param {Record<string, any>} target the target object
   */
  private static flattenObjectKeys(
    source: any,
    path: string[] = [],
    target: Record<string, any> = {},
  ) {
    if (typeof source === 'object') {
      for (const key in source) {
        this.flattenObjectKeys(source[key], [...path, key], target);
      }
    } else {
      target[path.join('.')] = source;
    }
  }

  /**
   * Parses configuration files and assign its contents to a configuration object.
   *
   * @param   {string[]} files  the configuration file paths
   * @returns {object}          the object representation of the configuration files
   */
  private static parseConfigurationFiles(files: string[]): Record<string, any> {
    const kv = {};
    const config = {};

    for (const file of files) {
      const parser = ConfigurationParserFactory.getParser(file);
      const parsed = parser.parse(file);
      Object.assign(config, parsed);
    }

    this.flattenObjectKeys(config, [], kv);

    return kv;
  }

  /**
   * Resolve the path of the configuration files.
   * It ignores files that does not exist or is not
   * suppported by the configuration parsers.
   *
   * @param   {string | string[]} path  the configuration path
   * @returns {string[]}                list of configuration files
   */
  private static resolveConfigurationFiles(path?: string | string[]): string[] {
    return ([] as string[])
      .concat(
        path !== undefined
          ? typeof path == 'string'
            ? [path]
            : [...path]
          : [],
        this.DEFAULT_CONFIG_FILES,
      )
      .filter(
        (file) =>
          fs.existsSync(file) && ConfigurationParserFactory.supports(file),
      );
  }
}
