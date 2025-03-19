# azure-secrets-example

To run this example, make sure you have your dev environment setup:

- Rename the `.env.example` file to `.env`
- Authorize your local env to access Azure Key Vault: https://learn.microsoft.com/en-us/azure/key-vault/general/authentication
- Create a secret inside your Key Vault
- Replace the values of the environment variables `AZURE_KEYVAULT_URL` and `AZURE_KEY_VAULT_DB_PASSWORD` with your Key Vault url and the secret id created

Run the application

```
npm install && npm run start
```

## How to work with Azure Key Vault

To resolve Azure Key Vault secrets, first install the required dependencies:

```
npm install @azure/identity @azure/keyvault-secrets
```

Import the `ConfigifyModule` to the application choosing the `AzureKeyVaultConfigurationResolver`:

```js
import { ConfigifyModule } from '@itgorillaz/configify';
import { AzureKeyVaultConfigurationResolverFactory } from '@itgorillaz/configify/configuration/resolvers/azure';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        AzureKeyVaultConfigurationResolverFactory.defaultKeyVaultConfigurationResolver(),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

If no url is given to the `defaultKeyVaultConfigurationResolver()`, the module will lookup for an environment variable called `AZURE_KEYVAULT_URL`.

Alternatively, you use your own instance of the `SecretClient` class from the `@azure/keyvault-secrets` package.

```js
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import {
  ConfigifyModule,
  RemoteConfigurationResolver,
} from '@itgorillaz/configify';
import { AzureKeyVaultConfigurationResolverFactory } from '@itgorillaz/configify/configuration/resolvers/azure';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        new RemoteConfigurationResolver(
          new AzureKeyVaultConfigurationResolver(
            new SecretClient(
              'your-key-vault-url',
              new DefaultAzureCredential(),
            ),
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
|:---------------:|:---------------:|:---------------:|
| AZURE_KEY_VAULT | azure-key-vault | azure-key-vault |

E.g.(.env):

```
AZURE_KEY_VAULT_DB_PASSWORD=key-vault-secret-id
```

```js
@Configuration()
export class DatabaseConfiguration {
  @Value('AZURE_KEY_VAULT_DB_PASSWORD')
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
