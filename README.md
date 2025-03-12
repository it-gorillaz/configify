<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center"><b>@itgorillaz/configify</b></p>
<p align="center">NestJS config on steroids</p>

<p align="center">
  <a href="https://buymeacoffee.com/tommelo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
</p>

## Description

**configify** is a NestJS configuration module that makes it easier to deal with configuration files and secrets.

## Installation

```bash
$ npm install --save @itgorillaz/configify
```

## Usage

To start using the <b>configify</b> module in your application import the module by calling the `forRootAsync` function:

```js
@Module({
  imports: [ConfigifyModule.forRootAsync()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Important Note**: When working with strict mode enabled `"strict": true`(tsconfig.json) it's necessary to set the option `strictPropertyInitialization` to `false` since the module will initialize the configuration class properties during runtime after resolving the values of the environment variables.

By default, when bootstraping, the module will lookup for a `.env`, an `application.yml` and an `application.json` file at the root folder of the project:

```
my-web-app
| .env
| application.yml
| application.json
```

You can also provide the location of the configuration files by overriding the configuration options.

### Mapping Configuration Classes

This module will lookup for every class decorated with `@Configuration` and it will make its instance globally available for the application.

Example of a `.env` file mapped to a class:

```
APPLICATION_CLIENT_ID=ABC
APPLICATION_CLIENT_TOKEN=TEST
```

```js
@Configuration()
export class ApplicationClientConfig {
  @Value('APPLICATION_CLIENT_ID')
  appClientId: string;

  @Value('APPLICATION_CLIENT_TOKEN')
  appClientToken: string
}
```

Example of a `.yml` file mapped to a class:

```
database:
  host: localhost
  port: 3306
  username: test
  password: test
  metadata: |
    {
      "label": "staging"
    }
```

```js
@Configuration()
export class DatabaseConfiguration {
  @Value('database.host')
  host: string;

  @Value('database.port', {
    parse: parseInt
  })
  port: number;

  @Value('database.metadata', {
    parse: JSON.parse
  })
  metadata: MetadataType;
}
```

You can map your configuration file to multiple configuration classes:

```
# database config
DATABASE_HOST=localhost
DATABASE_USER=test
DATABASE_PASSWORD=test

# okta config
OKTA_API_TOKEN=test
OKTA_CLIENT_ID=test
```

```js
@Configuration()
export class DatabaseConfiguration {
  // database configuration attributes
}
```

```js
@Configuration()
export class OktaConfiguration {
  // okta configuration attributes
}
```

### Dependency Injection

This module makes all the configuration instances globally available to the application, to access it you just need to declare the configuration class as an argument in the class constructor:

```js
export class AppService {
  private readonly LOGGER = new Logger(AppService.name);

  constructor(private readonly config: MyConfig) {
    this.LOGGER.log(JSON.stringify(config));
  }

}
```

### Variables Expansion

You can make use of variable expansion in your configuration files:

```
MY_API_KEY=${MY_SECRET} // --> MY_API_KEY=TEST
ANY_OTHER_CONFIG=TEST
MY_SECRET=TEST
APP_CLIENT_ID=${NON_EXISTING_ENV:-DEFAULT_ID} // --> APP_CLIENT_ID=DEFAULT_ID
```

### Defining Default Configuration Values

Other than defining default values with variables expansion, you can also define a default value to an attribute using the `default` option provided by the `@Value()` decorator:

```js
@Configuration()
export class DatabaseConfiguration {
  @Value('DB_HOST', { default: 'localhost' })
  host: string;

  @Value('DB_PORT', {
    parse: parseInt,
    default: 3306
  })
  port: number;
}
```

### Dealing with Secrets

Out of the box, this module can resolve AWS Secrets Manager and Parameter Store secrets.

For that, first is you need to install the required aws-sdk modules:

```
npm install @aws-sdk/client-ssm @aws-sdk/client-secrets-manager
```

then you can choose which strategies you would like to use to resolve AWS secrets:

```js
import { ConfigifyModule } from '@itgorillaz/configify';
import { AwsSecretsResolverFactory } from '@itgorillaz/configify/configuration/resolvers/aws';

// use default aws client instances
ConfigifyModule.forRootAsync({
  secretsResolverStrategies: [
    AwsSecretsResolverFactory.defaultParameterStoreResolver(),
    AwsSecretsResolverFactory.defaultSecretsManagerResolver(),
   ],
});

// or provide your own aws client instances
ConfigifyModule.forRootAsync({
  secretsResolverStrategies: [
    new AwsParameterStoreConfigurationResolver(new SSMClient())
    new AwsSecretsManagerConfigurationResolver(
      new SecretsManagerClient(),
    ),
   ],
});
```

Every configuration attribute stating with `AWS_SECRETS_MANAGER`, `AWS_PARAMETER_STORE`, `aws-secrets-manager` and `aws-parameter-store` will be considered a special configuration attribute and the module will try to resolve it's remote value.

E.g.: `.env`

```
MY_DB_PASSWORD=${AWS_SECRETS_MANAGER_DB_PASSWORD}
MY_API_TOKEN=${AWS_PARAMETER_STORE_API_TOKEN}

AWS_SECRETS_MANAGER_DB_PASSWORD=<secret-id-here>
AWS_PARAMETER_STORE_API_TOKEN=<parameter-name-here>
```

`application.yml`

```yaml
my-db-password: ${aws-secrets-manager.db.password}
my-api-token: ${aws-parameter-store.api.token}

aws-secrets-manager:
  db:
    password: <secret-id-here>

aws-parameter-store:
  api:
    token: <parameter-name-here>
```

```js
@Configuration()
export class SecretConfiguration {
  @Value('my-db-password') // or @Value('aws-secrets-manager.db.password')
  myDbPassword: string;

  @Value('my-api-token') // or @Value('aws-parameter-store.api.token')
  myApiToken: string;
}
```

### Parsing Configuration Values

Parsing a configuration value can be easily done by using a parse callback function available as argument of the `@Value()` decorator:

```yaml
db-json-config: |
  {
    "host": "localhost",
    "user": "test",
    "password": "test"
  }
```

```js
export interface MyDBConfig {
  host: string;
  user: string;
  password: string;
}

@Configuration()
export class SuperSecretConfiguration {
  @Value('db-json-config', {
    parse: JSON.parse
  })
  myDbConfig: MyDBConfig;
}
```

### Validating Configuration Classes

Depending on how critical a configuration is, you may want to validate it before starting the application, for that you can use [class-validator](https://github.com/typestack/class-validator) to make sure your configuration is loaded correctly:

```js
@Configuration()
export class MyConfiguration {
  @IsEmail()
  @Value('SENDER_EMAIL')
  senderEmail: string;

  @IsNotEmpty()
  @Value('my-api-token')
  myApiToken: string;
}
```

### Overwrite Default Options

You can overwrite default module options by providing an object as argument to the `forRootAsync()` method:

```js
/**
* Ignores any config file.
* The default value is false;
*/
ignoreConfigFile?: boolean;

/**
* Ignores environment variables
* The default value is false;
*/
ignoreEnvVars?: boolean;

/**
* The path of the configuration files
*/
configFilePath?: string | string[];

/**
* Expands variables
* The default value is true
*/
expandConfig?: boolean;

/**
 * The secrets resolvers strategies
 */
secretsResolverStrategies?: ConfigurationResolver[];
```

## License

This code is licensed under the [MIT License](./LICENSE.txt).

All files located in the node_modules and external directories are externally maintained libraries used by this software which have their own licenses; we recommend you read them, as their terms may differ from the terms in the MIT License.
