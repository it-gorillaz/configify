import { RemoteConfigurationResolverStrategy } from '@itgorillaz/configify';
import { Axios } from 'axios';

interface CustomSecret {
  value: string;
}

export class CustomConfigurationResolver
  implements RemoteConfigurationResolverStrategy
{
  configurationKeys: readonly string[] = ['CUSTOM_SECRET', 'custom-secret'];

  constructor(
    private readonly url: string,
    private readonly axios: Axios,
  ) {}

  async resolveSecretValue(id: string): Promise<string | undefined> {
    const secretId = `${this.url}/${id}`;
    const result = await this.axios.get<CustomSecret>(secretId);
    return result.data.value;
  }
}
