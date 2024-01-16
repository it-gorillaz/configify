import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { ConfigurationParser } from '../configuration-parser.interface';

/**
 * Dotenv configuration parser.
 */
export class DotEnvConfigurationParser implements ConfigurationParser {
  /**
   * Reads the configuration file and assign
   * its contents to an object.
   * @param   {string}              file the configuration file
   * @returns {Record<string, any>}      an object representation of the configuration file
   */
  public parse(file: string): Record<string, any> {
    return dotenv.parse(fs.readFileSync(file));
  }
}
