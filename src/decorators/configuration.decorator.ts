import { ConfigurationRegistry } from '../configuration/configuration.registry';

/**
 * The configuration metadata
 */
export const CONFIGURATION_METADATA = Symbol.for('__configuration__');

/**
 * The configuration decorator.
 *
 * Decorating a class with this decorator will make it
 * visible for the module to manage its instance and assign
 * values to the class attributes based on configuration files.
 *
 * @returns {ClassDecorator} the class decorator
 */
export const Configuration = (): ClassDecorator => {
  return (target: object) => {
    ConfigurationRegistry.registerTarget(target);
    Reflect.defineMetadata(
      CONFIGURATION_METADATA,
      target.constructor.name,
      target,
    );
  };
};
