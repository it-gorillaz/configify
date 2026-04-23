import { resolve } from 'path';
import { JsonConfigurationParser } from '../../src/configuration';

describe('JsonConfigurationParser', () => {
  const parser = new JsonConfigurationParser();

  describe('parse()', () => {
    it('should parse a valid .json file', () => {
      const file = resolve(process.cwd(), 'test/config/.basic.json');
      expect(parser.parse(file)).toEqual({
        'any-key-one': 'any-value-one',
        'any-key-two': 'any-value-two',
      });
    });

    it('should throw when the file does not exist', () => {
      expect(() => parser.parse('/non/existent/file.json')).toThrow();
    });

    it('should throw a SyntaxError for malformed JSON', () => {
      const malformedFile = resolve(process.cwd(), 'test/config/.basic.yml');
      expect(() => parser.parse(malformedFile)).toThrow(SyntaxError);
    });
  });
});
