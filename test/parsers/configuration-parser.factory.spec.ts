import {
  ConfigurationParserFactory,
  DotEnvConfigurationParser,
  JsonConfigurationParser,
  YamlConfigurationParser,
} from '../../src/configuration';

describe('ConfigurationParserFactory', () => {
  describe('supports()', () => {
    it.each([
      { file: '.env', expected: true },
      { file: 'application.yml', expected: true },
      { file: 'application.yaml', expected: true },
      { file: 'application.json', expected: true },
      { file: 'application.xml', expected: false },
      { file: 'no-extension', expected: false },
    ])('should return $expected for "$file"', ({ file, expected }) => {
      expect(ConfigurationParserFactory.supports(file)).toBe(expected);
    });
  });

  describe('getParser()', () => {
    it('should return DotEnvConfigurationParser for .env', () => {
      expect(ConfigurationParserFactory.getParser('.env')).toBeInstanceOf(DotEnvConfigurationParser);
    });

    it('should return YamlConfigurationParser for .yml', () => {
      expect(ConfigurationParserFactory.getParser('application.yml')).toBeInstanceOf(YamlConfigurationParser);
    });

    it('should return YamlConfigurationParser for .yaml', () => {
      expect(ConfigurationParserFactory.getParser('application.yaml')).toBeInstanceOf(YamlConfigurationParser);
    });

    it('should return JsonConfigurationParser for .json', () => {
      expect(ConfigurationParserFactory.getParser('application.json')).toBeInstanceOf(JsonConfigurationParser);
    });

    it('should throw for an unsupported extension', () => {
      expect(() => ConfigurationParserFactory.getParser('application.xml')).toThrow(
        'Unsupported configuration file extension: ".xml" (file: "application.xml")',
      );
    });
  });
});
