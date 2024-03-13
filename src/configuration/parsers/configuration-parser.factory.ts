import { ConfigurationParser } from '../configuration-parser.interface';
import { DotEnvConfigurationParser } from './dotenv-configuration.parser';
import { JsonConfigurationParser } from './json-configuration.parser';
import { YamlConfigurationParser } from './yaml-configuration.parser';

/**
 * The configuration parser factory.
 * This factory class contains all the supported
 * file configuration parsers.
 */
export class ConfigurationParserFactory {
  /**
   * The supported file configuration parsers
   */
  private static readonly parsers = {
    env: new DotEnvConfigurationParser(),
    yml: new YamlConfigurationParser(),
    yaml: new YamlConfigurationParser(),
    json: new JsonConfigurationParser(),
  };

  /**
   * Gets the file configuration parser based
   * on the file extension.
   * @param   {string}              file the configuration file name
   * @returns {ConfigurationParser}      the configuration parser
   */
  static getParser(file: string): ConfigurationParser {
    const ext = this.getFileExt(file);
    return this.parsers[ext];
  }

  /**
   * Checks if the given file has a parser registered.
   *
   * @param   {string} file the configuration file name
   * @returns {boolean}     true if a parser is found, false otherwise
   */
  static supports(file: string): boolean {
    const ext = this.getFileExt(file);
    return this.parsers.hasOwnProperty(ext);
  }

  /**
   * Returns the file extension.
   *
   * @param   {string} file the file name
   * @returns {string}      the file extension
   */
  private static getFileExt(file: string): string {
    return file.split('.').pop();
  }
}
