import {
  ValueDecoratedKey,
  VALUE_METADATA,
  VALUE_PROPERTIES_METADATA,
} from '../decorators';

/**
 * The configuration registry.
 *
 * The registry keeps track of all classes decorated
 * with Configuration decorator.
 */
export class ConfigurationRegistry {
  private static readonly registry: Array<unknown> = [];

  /**
   * Registers a type.
   *
   * @param {any} type the class type
   */
  static registerTarget(type: any): void {
    this.registry.push(type);
  }

  /**
   * Registers a class attribute.
   *
   * @param {any}    target    the class target
   * @param {string} attribute the attribute name
   */
  static registerAttribute(target: any, attribute: string): void {
    (
      target[VALUE_PROPERTIES_METADATA] ||
      (target[VALUE_PROPERTIES_METADATA] = [])
    ).push(attribute);
  }

  /**
   * Returns the configuration registry.
   *
   * @returns {any[]} the configuration registry
   */
  static getRegistry(): any[] {
    return this.registry;
  }

  /**
   * Returns the class attribute names decorated with Decorated decorator
   *
   * @param   {any}      target the instance target;
   * @returns {string[]} the list of attribute names
   */
  static getValueDecoratedAttributes(target: any): string[] {
    return target[VALUE_PROPERTIES_METADATA];
  }

  /**
   * Returns the value of the decorated key.
   *
   * @param   {any}               instance  the target instance
   * @param   {string}            attribute the attribute name
   * @returns {ValueDecoratedKey}           the value decorated key
   */
  static getValueDecoratedKey(
    instance: any,
    attribute: string,
  ): ValueDecoratedKey {
    return Reflect.getMetadata(VALUE_METADATA, instance, attribute);
  }
}
