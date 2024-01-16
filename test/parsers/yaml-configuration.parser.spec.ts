import { resolve } from 'path';
import { YamlConfigurationParser } from '../../src/configuration';

describe('YamlConfigurationParser', () => {
  describe('parse()', () => {
    it('should parse .env file', () => {
      const file = resolve(process.cwd(), 'test/config/.basic.yml');
      const parser = new YamlConfigurationParser();
      const config = parser.parse(file);
      expect(config).toEqual({
        application: {
          'any-key-one': 'any-value-one',
          'any-key-two': 'any-value-two',
        },
      });
    });
  });
});
