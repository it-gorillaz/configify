import { ConfigurationRegistry } from '../configuration/configuration.registry';

/**
 * The value metadata.
 */
export const VALUE_METADATA = Symbol.for('__value__');

/**
 * The value properties metadata.
 */
export const VALUE_PROPERTIES_METADATA = Symbol.for('__properties__');

/**
 * The value options.
 * Allows custom parsing to configuration values
 */
export interface ValueOptions {
  /**
   * Parses the configuration value.
   * @param value
   * @returns parsed value
   */
  parse?: (value: any) => unknown;

  /**
   * Sets a default value if the configuration key is not found.
   */
  default?: any;
}

/**
 * The value decorated key interface.
 */
export interface ValueDecoratedKey {
  key: string;
  options?: ValueOptions;
}

/**
 * The value decorator.
 *
 * This decorator defines which configuration key should
 * be assined to the class attribute.
 *
 * @param   {string}            key     the configuration key
 * @param   {ValueOptions}      options custom options
 * @returns {PropertyDecorator}         the property decorator
 */
export const Value = (
  key: string,
  options?: ValueOptions,
): PropertyDecorator => {
  return (target: object, property: string | symbol) => {
    ConfigurationRegistry.registerAttribute(target, property);
    Reflect.defineMetadata(VALUE_METADATA, { key, options }, target, property);
  };
};
