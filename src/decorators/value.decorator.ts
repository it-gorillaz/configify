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
export interface ValueOptions<T = unknown> {
  /**
   * Parses the configuration value.
   * It is not called for the default value.
   * @param value
   * @returns parsed value
   */
  parse?: (value: string) => T;

  /**
   * Sets a default value if the configuration key is not found.
   * The default value is used as is, without parsing.
   */
  default?: T;
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
export const Value = <T>(
  key: string,
  options?: ValueOptions<T>,
): PropertyDecorator => {
  return (target: object, property: string | symbol) => {
    ConfigurationRegistry.registerAttribute(target, property);
    Reflect.defineMetadata(VALUE_METADATA, { key, options }, target, property);
  };
};
