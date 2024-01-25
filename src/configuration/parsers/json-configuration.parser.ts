import * as fs from 'fs';
import { ConfigurationParser } from '../configuration-parser.interface';

/**
 * JSON configuration parser
 */
export class JsonConfigurationParser implements ConfigurationParser {
  /**
   * Reads the configuration file and assign
   * its contents to an object.
   * @param   {string}              file the configuration file
   * @returns {Record<string, any>}      an object representation of the configuration file
   */
  public parse(file: string): Record<string, any> {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
}
