# gcp-secrets-example

To run this example, make sure you have your dev environment setup:

- Rename the `.env.example` file to `.env`
- Create a secret on your GCP Secret Manager
- Replace the value of the environment variable `GCP_SECRET_MANAGER_DB_PASSWORD` with your secret id created
- Make sure your dev environment is authenticated and has permission to access the Secret Manager: https://cloud.google.com/docs/authentication/gcloud

Run the application

```
npm install && npm run start
```

## How to work with GCP Secret Manager

To resolve GCP Secrets Manager secrets, first install the required dependencies:

```
npm install @google-cloud/secret-manager
```

Import the `ConfigifyModule` to the application choosing the `GoogleCloudSecretManagerConfigurationResolver`:

```js
import { ConfigifyModule } from '@itgorillaz/configify';
import { GoogleCloudSecretsResolverFactory } from '@itgorillaz/configify/configuration/resolvers/gcp';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        GoogleCloudSecretsResolverFactory.defaultSecretManagerConfigurationResolver(),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Alternatively, you use your own instance of the `SecretManagerServiceClient` class from the `@google-cloud/secret-manager` package.

```js
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import {
  ConfigifyModule,
  RemoteConfigurationResolver,
} from '@itgorillaz/configify';
import { GoogleCloudSecretManagerConfigurationResolver } from '@itgorillaz/configify/configuration/resolvers/gcp';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        new RemoteConfigurationResolver(
          new GoogleCloudSecretManagerConfigurationResolver(
            new SecretManagerServiceClient(),
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
|:------------------:|:------------------:|:------------------:|
| GCP_SECRET_MANAGER | gcp-secret-manager | gcp-secret-manager |

E.g.(.env):

```
GCP_SECRET_MANAGER_DB_PASSWORD=secret-id
```

```js
@Configuration()
export class DatabaseConfiguration {
  @Value('GCP_SECRET_MANAGER_DB_PASSWORD')
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
