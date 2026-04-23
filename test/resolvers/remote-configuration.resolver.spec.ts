import { RemoteConfigurationResolver, RemoteConfigurationResolverStrategy } from '../../src/configuration/resolvers';

describe('RemoteConfigurationResolver', () => {
  const resolveSecretValueMock = jest.fn();

  const mockStrategy: RemoteConfigurationResolverStrategy = {
    configurationKeys: ['SECRET_'],
    resolveSecretValue: resolveSecretValueMock,
  };

  let resolver: RemoteConfigurationResolver;

  beforeEach(() => {
    resolveSecretValueMock.mockReset();
    resolver = new RemoteConfigurationResolver(mockStrategy);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('resolve()', () => {
    it('should resolve matched keys and leave unmatched keys unchanged', async () => {
      resolveSecretValueMock.mockResolvedValue('resolved-value');

      const result = await resolver.resolve({
        SECRET_DB_PWD: 'secret-id-123',
        OTHER_KEY: 'plain-value',
      });

      expect(result).toEqual({
        SECRET_DB_PWD: 'resolved-value',
        OTHER_KEY: 'plain-value',
      });
      expect(resolveSecretValueMock).toHaveBeenCalledTimes(1);
      expect(resolveSecretValueMock).toHaveBeenCalledWith('secret-id-123');
    });

    it('should return config unchanged when no keys match the strategy prefix', async () => {
      const config = { UNMATCHED_KEY: 'value' };

      const result = await resolver.resolve(config);

      expect(result).toEqual({ UNMATCHED_KEY: 'value' });
      expect(resolveSecretValueMock).not.toHaveBeenCalled();
    });

    it('should return config unchanged when configurationKeys is empty', async () => {
      const emptyStrategyResolver = new RemoteConfigurationResolver({
        configurationKeys: [],
        resolveSecretValue: resolveSecretValueMock,
      });

      const result = await emptyStrategyResolver.resolve({ SECRET_DB_PWD: 'secret-id' });

      expect(result).toEqual({ SECRET_DB_PWD: 'secret-id' });
      expect(resolveSecretValueMock).not.toHaveBeenCalled();
    });

    it('should aggregate and throw all backend resolution errors', async () => {
      resolveSecretValueMock.mockRejectedValue(new Error('not found'));

      await expect(
        resolver.resolve({ SECRET_A: 'id-a', SECRET_B: 'id-b' }),
      ).rejects.toThrow('Unable to resolve parameter');
    });

    it('should throw for a null secret ID', async () => {
      await expect(
        resolver.resolve({ SECRET_KEY: null } as any),
      ).rejects.toThrow('Invalid secret ID: expected a non-empty string, got null');
    });

    it('should throw for an empty string secret ID', async () => {
      await expect(
        resolver.resolve({ SECRET_KEY: '' }),
      ).rejects.toThrow('Invalid secret ID: expected a non-empty string, got ""');
    });

    it('should throw for a blank string secret ID', async () => {
      await expect(
        resolver.resolve({ SECRET_KEY: '   ' }),
      ).rejects.toThrow('Invalid secret ID: expected a non-empty string, got "   "');
    });

    it('should throw for a non-string secret ID', async () => {
      await expect(
        resolver.resolve({ SECRET_KEY: 42 } as any),
      ).rejects.toThrow('Invalid secret ID: expected a non-empty string, got 42');
    });
  });
});
