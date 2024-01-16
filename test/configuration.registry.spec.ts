import { ConfigurationRegistry } from '../src/configuration';
import { BasicDotEnvConfiguration } from '../test/config/basic-dot-env.configuration';

describe('ConfigurationRegistry', () => {
  describe('getRegistry()', () => {
    it('should contain configuration targets', () => {
      const registry = ConfigurationRegistry.getRegistry();
      expect(registry.length).toEqual(1);
      expect(registry[0].name).toEqual(BasicDotEnvConfiguration.name);
    });
  });

  describe('getValueDecoratedAttributes()', () => {
    it('should contain value decorated attributes', () => {
      const registry = ConfigurationRegistry.getRegistry();
      const attributes = ConfigurationRegistry.getValueDecoratedAttributes(
        new registry[0](),
      );
      expect(attributes).toEqual(
        expect.arrayContaining(['testEnvOne', 'testEnvTwo']),
      );
    });
  });

  describe('getValueDecoratedKey()', () => {
    it('should contain value decorated attributes', () => {
      const registry = ConfigurationRegistry.getRegistry();
      const instance = new registry[0]();

      const metadataOne = ConfigurationRegistry.getValueDecoratedKey(
        instance,
        'testEnvOne',
      );

      const metadataTwo = ConfigurationRegistry.getValueDecoratedKey(
        instance,
        'testEnvTwo',
      );

      expect(metadataOne.key).toContain('TEST_ENV_ONE');
      expect(metadataTwo.key).toContain('TEST_ENV_TWO');
    });
  });
});
