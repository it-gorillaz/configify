import { Injectable } from '@nestjs/common';
import { SecretsConfiguration } from './secrets.configuration';

@Injectable()
export class AppService {
  constructor(private readonly config: SecretsConfiguration) {}

  getConfig(): string {
    return JSON.stringify(this.config);
  }
}
