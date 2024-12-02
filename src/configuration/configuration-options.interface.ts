import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { SSMClient } from '@aws-sdk/client-ssm';

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
   * The AWS Secrets Manager Client
   * If no client is provided, the module will create one.
   */
  secretsManagerClient?: SecretsManagerClient;

  /**
   * The AWS Systems Manager Client
   * If no client is provided, the module will create one.
   */
  ssmClient?: SSMClient;
}

/**
 * The default module options
 */
export const DefaultConfigifyModuleOptions: ConfigifyModuleOptions = {
  ignoreConfigFile: false,
  ignoreEnvVars: false,
  expandConfig: true,
};
