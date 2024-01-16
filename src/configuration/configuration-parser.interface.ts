/**
 * The configuraion parser interface.
 * This interface is implemented by all
 * the supported configuration parsers.
 */
export interface ConfigurationParser {
  /**
   * Reads a file and assign its values
   * to an object representation;
   *
   * @param   {string}              file the configuration file path
   * @returns {Record<string, any>}      the object representation of the configuration file
   */
  parse(file: string): Record<string, any>;
}
