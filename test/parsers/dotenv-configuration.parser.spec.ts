import { resolve } from 'path';
import { DotEnvConfigurationParser } from '../../src/configuration';

describe('DotEnvConfigurationParser', () => {
  describe('parse()', () => {
    it('should parse .env file', () => {
      const file = resolve(process.cwd(), 'test/config/.basic.env');
      const parser = new DotEnvConfigurationParser();
      const config = parser.parse(file);
      expect(config).toEqual({
        TEST_ENV_ONE: 'ANY_VALUE_ONE',
        TEST_ENV_TWO: 'ANY_VALUE_TWO',
      });
    });
  });
});
