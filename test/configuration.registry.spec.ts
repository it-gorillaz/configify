import { ConfigurationRegistry } from '../src/configuration';
import { BasicDotEnvConfiguration } from '../test/config/basic-dot-env.configuration';

describe('ConfigurationRegistry', () => {
  describe('getRegistry()', () => {
    it('should contain registered configuration targets', () => {
      const registry = ConfigurationRegistry.getRegistry();
      expect(registry).toContain(BasicDotEnvConfiguration);
    });
  });

  describe('registerTarget()', () => {
    it('should throw on duplicate registration', () => {
      expect(() =>
        ConfigurationRegistry.registerTarget(BasicDotEnvConfiguration),
      ).toThrow(
        `Duplicate configuration target registration: ${BasicDotEnvConfiguration.name}`,
      );
    });
  });

  describe('getValueDecoratedAttributes()', () => {
    it('should return the list of value-decorated attribute names', () => {
      const attributes = ConfigurationRegistry.getValueDecoratedAttributes(
        new BasicDotEnvConfiguration(),
      );
      expect(attributes).toEqual(expect.arrayContaining(['testEnvOne', 'testEnvTwo']));
    });

    it('should return an empty array for a class with no decorated attributes', () => {
      class PlainClass {}
      expect(ConfigurationRegistry.getValueDecoratedAttributes(new PlainClass())).toEqual([]);
    });
  });

  describe('getValueDecoratedKey()', () => {
    it('should return the metadata for each decorated attribute', () => {
      const instance = new BasicDotEnvConfiguration();

      const metadataOne = ConfigurationRegistry.getValueDecoratedKey(instance, 'testEnvOne');
      const metadataTwo = ConfigurationRegistry.getValueDecoratedKey(instance, 'testEnvTwo');

      expect(metadataOne.key).toBe('TEST_ENV_ONE');
      expect(metadataTwo.key).toBe('TEST_ENV_TWO');
    });
  });
});
