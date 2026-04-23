import { resolve } from 'path';
import { YamlConfigurationParser } from '../../src/configuration';

describe('YamlConfigurationParser', () => {
  const parser = new YamlConfigurationParser();

  describe('parse()', () => {
    it('should parse a valid .yml file', () => {
      const file = resolve(process.cwd(), 'test/config/.basic.yml');
      expect(parser.parse(file)).toEqual({
        application: {
          'any-key-one': 'any-value-one',
          'any-key-two': 'any-value-two',
        },
      });
    });

    it('should throw when the file does not exist', () => {
      expect(() => parser.parse('/non/existent/file.yml')).toThrow();
    });
  });
});
