import { ConfigurationResolver } from './resolvers';

/**
 * The configuration options interface
 */
export interface ConfigifyModuleOptions {
  /**
   * Ignores any config file.
   * The default value is false;
   */
  ignoreConfigFile?: boolean;

  /**
   * Ignores environment variables
   * The default value is false;
   */
  ignoreEnvVars?: boolean;

  /**
   * The path of the configuration files
   */
  configFilePath?: string | string[];

  /**
   * Expands variables
   * The default value is true
   */
  expandConfig?: boolean;

  /**
   * The secrets resolvers strategies
   */
  secretsResolverStrategies?: ConfigurationResolver[];
}

/**
 * The default module options
 */
export const DefaultConfigifyModuleOptions: ConfigifyModuleOptions = {
  ignoreConfigFile: false,
  ignoreEnvVars: false,
  expandConfig: true,
};
