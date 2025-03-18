# custom-secrets-example

The easiest way to get this example up and running:

```
docker-compose up
```

## How to define a custom configuration resolver

You can use your own custom configuration resolver by implementing the interface `RemoteConfigurationResolverStrategy`:

```js
import { RemoteConfigurationResolverStrategy } from '@itgorillaz/configify';
import { Axios } from 'axios';

interface CustomSecret {
  value: string;
}

@Injectable()
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
```

When initializing the `ConfigifyModule`, provide your custom strategy:

```js
import {
  ConfigifyModule,
  RemoteConfigurationResolver,
} from '@itgorillaz/configify';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        new RemoteConfigurationResolver(
          new CustomConfigurationResolver('any-endpoint-url', new Axios()),
        ),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

In this example, the module will lookup for any env or key starting with:
| env | yml | json |
|:-------------:|:-------------:|:-------------:|
| CUSTOM_SECRET | custom-secret | custom-secret |

E.g.(.env):

```
CUSTOM_SECRET_DB_PASSWORD=my-custom-secret-id
```

```js
@Configuration()
export class DatabaseConfiguration {
  @Value('CUSTOM_SECRET_DB_PASSWORD')
  dbPassword: string;
}
```

You can then inject your configuration where is needed:

```js
@Injectable()
export class MyService {
  constructor(private readonly config: DatabaseConfiguration) {}
}
```
