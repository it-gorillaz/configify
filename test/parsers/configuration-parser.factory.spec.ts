import {
  ConfigurationParserFactory,
  DotEnvConfigurationParser,
  YamlConfigurationParser,
} from '../../src/configuration';

describe('Configuration Parser Factory', () => {
  describe('supports()', () => {
    it('should return true when configuration type is supported', () => {
      const result = ConfigurationParserFactory.supports('application.yml');
      expect(result).toBeTruthy();
    });

    it('should return false when configuration type is not supported', () => {
      const result = ConfigurationParserFactory.supports('application.xml');
      expect(result).toBeFalsy();
    });
  });

  describe('getParser()', () => {
    it('should return .env configuration parser', () => {
      const result = ConfigurationParserFactory.getParser('.env');
      expect(result).toBeInstanceOf(DotEnvConfigurationParser);
    });

    it('should return yaml configuration parser', () => {
      const result = ConfigurationParserFactory.getParser('application.yml');
      expect(result).toBeInstanceOf(YamlConfigurationParser);
    });

    it('should return undefined when no parser is found', () => {
      const result = ConfigurationParserFactory.getParser('application.xml');
      expect(result).toBeUndefined();
    });
  });
});
