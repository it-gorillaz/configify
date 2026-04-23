import { resolve } from 'path';
import { DotEnvConfigurationParser } from '../../src/configuration';

describe('DotEnvConfigurationParser', () => {
  const parser = new DotEnvConfigurationParser();

  describe('parse()', () => {
    it('should parse a valid .env file', () => {
      const file = resolve(process.cwd(), 'test/config/.basic.env');
      expect(parser.parse(file)).toEqual({
        TEST_ENV_ONE: 'ANY_VALUE_ONE',
        TEST_ENV_TWO: 'ANY_VALUE_TWO',
      });
    });

    it('should throw when the file does not exist', () => {
      expect(() => parser.parse('/non/existent/.env')).toThrow();
    });
  });
});
