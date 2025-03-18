# aws-secrets-example

The easiest way to get this example up and running:

```
docker-compose up
```

If you have your dev environment setup, you can run:

```
npm run start
```

The application will lookup for a parameter store named `/secret/db/password` and a secret on secrets manager named `my-db-secret`.

## How to work with AWS Parameter Store and Secrets Manager

In order to this module to pull secrets from AWS Parameter Store or Secrets Manager, first you need to add the aws sdk to your project:

```
npm install @aws-sdk/client-ssm @aws-sdk/client-secrets-manager
```

When initializing the `ConfigifyModule`, you can choose which strategy will be used to resolve the AWS secrets:

```js
@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        AwsSecretsResolverFactory.defaultSecretsManagerResolver(),
        AwsSecretsResolverFactory.defaultParameterStoreResolver(),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Alternatively, you can initialize the module passing your own instance of the aws sdk:

```js
import { SSMClient } from '@aws-sdk/client-ssm';
import {
  ConfigifyModule,
  RemoteConfigurationResolver,
} from '@itgorillaz/configify';
import { AwsParameterStoreConfigurationResolver } from '@itgorillaz/configify/configuration/resolvers/aws';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        new RemoteConfigurationResolver(
          new AwsParameterStoreConfigurationResolver(new SSMClient()),
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
|:-------------------:|:-------------------:|:-------------------:|
| AWS_PARAMETER_STORE | aws-parameter-store | aws-parameter-store |
| AWS_SECRETS_MANAGER | aws-secrets-manager | aws-secrets-manager |

E.g.(.env):

```
AWS_PARAMETER_STORE_DB_PASSWORD=/my/db/password
```

```js
@Configuration()
export class DatabaseConfiguration {
  @Value('AWS_PARAMETER_STORE_DB_PASSWORD')
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
