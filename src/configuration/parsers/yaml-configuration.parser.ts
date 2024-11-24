import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ConfigurationParser } from '../configuration-parser.interface';

/**
 * YAML configuration parser
 */
export class YamlConfigurationParser implements ConfigurationParser {
  /**
   * Reads the configuration file and assign
   * its contents to an object.
   * @param   {string}              file the configuration file
   * @returns {Record<string, any>}      an object representation of the configuration file
   */
  public parse(file: string): Record<string, any> {
    return yaml.load(fs.readFileSync(file, 'utf-8')) as Record<string, any>;
  }
}
