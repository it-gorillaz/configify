/**
 * Remote configuration resolver strategy.
 * This interface defines the contract for a remote configuration resolver strategy.
 */
export interface RemoteConfigurationResolverStrategy {
  /**
   * The configuration keys that this resolver can resolve.
   */
  configurationKeys: Readonly<string[]>;

  /**
   *  Resolves the secret value.
   * @param id the secret id
   * @returns the secret value
   */
  resolveSecretValue(id: string): Promise<string | undefined>;
}
