# bitwarden-secrets-example

To run this example, make sure you have your dev environment setup:

- Rename the `.env.example` file to `.env`
- Create a secret on your Secrets Manager
- Replace the values of the environment variables `BWS_ACCESS_TOKEN` and `BITWARDEN_SECRETS_MANAGER_DB_PASSWORD` with your Bitwarden access token and the secret id created

Run the application

```
npm install && npm run start
```

## How to work with Bitwarden Secrets Manager

To resolve Bitwarden Secrets Manager secrets, first install the required dependencies:

```
npm install @bitwarden/sdk-napi
```

Import the `ConfigifyModule` to the application choosing the `BitwardenSecretsManagerConfigurationResolver`:

```js
import { ConfigifyModule } from '@itgorillaz/configify';
import {
  BitwardenSecretsResolverFactory,
  BitwardenServerRegion,
} from '@itgorillaz/configify/configuration/resolvers/bitwarden';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        BitwardenSecretsResolverFactory.defaultBitwardenSecretsResolver(
          BitwardenServerRegion.EU,
        ),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

If no access token is given to the `defaultBitwardenSecretsResolver()` method, the module will lookup for an environment variable called `BWS_ACCESS_TOKEN`.

Alternatively, you use your own instance of the `BitwardenClient` class from the `@bitwarden/sdk-napi` package.

```js
import {
  BitwardenClient,
  ClientSettings,
  DeviceType,
} from '@bitwarden/sdk-napi';
import {
  ConfigifyModule,
  RemoteConfigurationResolver,
} from '@itgorillaz/configify';
import { BitwardenSecretsManagerConfigurationResolver } from '@itgorillaz/configify/configuration/resolvers/bitwarden';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        new RemoteConfigurationResolver(
          new BitwardenSecretsManagerConfigurationResolver(
            new BitwardenClient({
              apiUrl: 'https://api.bitwarden.com',
              identityUrl: 'https://identity.bitwarden.com',
              userAgent: 'Bitwarden SDK',
              deviceType: DeviceType.SDK,
            }),
            'your-access-token',
          ),
        ),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

The module will try to resolve any environment variable, yml or json key starting with:
| env | yml | json |
|:-------------------------:|:-------------------------:|:-------------------------:|
| BITWARDEN_SECRETS_MANAGER | bitwarden-secrets-manager | bitwarden-secrets-manager |

E.g.(.env):

```
BITWARDEN_SECRETS_MANAGER_DB_PASSWORD=secret-id
```

```js
@Configuration()
export class DatabaseConfiguration {
  @Value('BITWARDEN_SECRETS_MANAGER_DB_PASSWORD')
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
