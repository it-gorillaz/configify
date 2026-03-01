/**
 * Marks a class as expecting constructor args payload for configuration.
 * This is used by the module to determine if the class should be instantiated with constructor args.
 */
export const REQUIRED_ARGS_CONSTRUCTOR_METADATA = Symbol.for(
  'REQUIRED_ARGS_CONSTRUCTOR_METADATA',
);

/**
 * Class decorator to mark a class as expecting constructor args payload for configuration.
 *
 * @returns {ClassDecorator} the class decorator function to apply the metadata to the target class.
 */
export function RequiredArgsConstructor(): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(REQUIRED_ARGS_CONSTRUCTOR_METADATA, true, target);
  };
}
