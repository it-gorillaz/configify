import { resolve } from 'path';
import { JsonConfigurationParser } from '../../src/configuration';

describe('JsonConfigurationParser', () => {
  describe('parse()', () => {
    it('should parse .json file', () => {
      const file = resolve(process.cwd(), 'test/config/.basic.json');
      const parser = new JsonConfigurationParser();
      const config = parser.parse(file);
      expect(config).toEqual({
        'any-key-one': 'any-value-one',
        'any-key-two': 'any-value-two',
      });
    });
  });
});
