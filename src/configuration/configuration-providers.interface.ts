import { Provider } from '@nestjs/common';

/**
 * The configuration providers interface
 */
export interface ConfigurationProviders {
  exports: any[];
  providers: Provider[];
}
