/**
 * The configuration resolver interface
 */
export interface ConfigurationResolver {
  /**
   * Resolves a remote configuration
   *
   * @param {Record<string, any>} configuration the configuration object
   */
  resolve(configuration: Record<string, any>): Promise<Record<string, any>>;
}
