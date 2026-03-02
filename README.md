<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center"><b>@itgorillaz/configify</b></p>
<p align="center">NestJS config on steroids</p>

<p align="center">
  <a href="https://buymeacoffee.com/tommelo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
</p>

# configify

**configify** is a NestJS configuration module that simplifies loading, validating, and injecting configuration from environment variables, config files, and remote secret managers.

## Installation

```bash
npm install --save @itgorillaz/configify
```

---

## Quick Start

Import `ConfigifyModule` into your root module using `forRootAsync()`:

```typescript
import { ConfigifyModule } from '@itgorillaz/configify';

@Module({
  imports: [ConfigifyModule.forRootAsync()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

> **TypeScript strict mode:** If you have `"strict": true` in your `tsconfig.json` and you are not using [constructor configuration injection](#mapping-configuration-classes-with-constructor-injection), you must also set `"strictPropertyInitialization": false`. This is required because configify initializes configuration properties at runtime.
>
> ```json
> {
>   "compilerOptions": {
>     "strict": true,
>     "strictPropertyInitialization": false
>   }
> }
> ```

---

## Configuration File Discovery

By default, configify looks for the following files in the **root of your project**:

```
my-app/
├── .env
├── application.yml
└── application.json
```

All three formats are supported and can be used together. You can also [customize the file paths](#overriding-default-options).

---

## Mapping Configuration Classes

Decorate any class with `@Configuration()` and configify will automatically discover it, populate its properties, and make the instance available for dependency injection throughout your application.

### From a `.env` file

```bash
# .env
APPLICATION_CLIENT_ID=ABC
APPLICATION_CLIENT_TOKEN=TEST
```

```typescript
import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class ApplicationClientConfig {
  @Value('APPLICATION_CLIENT_ID')
  appClientId: string;

  @Value('APPLICATION_CLIENT_TOKEN')
  appClientToken: string;
}
```

### From a `.yml` file

```yaml
# application.yml
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

```typescript
import { Configuration, Value } from '@itgorillaz/configify';

interface DatabaseMetadata {
  label: string;
}

@Configuration()
export class DatabaseConfiguration {
  @Value('database.host')
  host: string;

  @Value('database.port', { parse: parseInt })
  port: number;

  @Value('database.metadata', { parse: JSON.parse })
  metadata: DatabaseMetadata;
}
```

### Splitting one file into multiple configuration classes

A single config file can be split across multiple configuration classes to keep concerns separated:

```bash
# .env
DATABASE_HOST=localhost
DATABASE_USER=test
DATABASE_PASSWORD=test

OKTA_API_TOKEN=test
OKTA_CLIENT_ID=test
```

```typescript
@Configuration()
export class DatabaseConfiguration {
  @Value('DATABASE_HOST')
  host: string;

  @Value('DATABASE_USER')
  user: string;

  @Value('DATABASE_PASSWORD')
  password: string;
}

@Configuration()
export class OktaConfiguration {
  @Value('OKTA_API_TOKEN')
  apiToken: string;

  @Value('OKTA_CLIENT_ID')
  clientId: string;
}
```

### Mapping Configuration Classes with Constructor Injection

Decorate your configuration class with `@RequiredArgsConstructor()` and configify will automatically create the instance of the configuration class passing the configuration values as an object to the constructor.

```bash
# .env
DATABASE_HOST=localhost
DATABASE_USER=test
DATABASE_PASSWORD=test
```

```typescript
@Configuration()
@RequiredArgsConstructor()
export class DatabaseConfiguration {
  @Value('DATABASE_HOST')
  host: string;

  @Value('DATABASE_USER')
  user: string;

  @Value('DATABASE_PASSWORD')
  password: string;

  constructor(config: Required<DatabaseConfiguration>) {
    this.host = config.host;
    this.user = config.user;
    this.password = config.password;
  }
}
```

---

## Dependency Injection

All `@Configuration()` classes are registered globally. Inject them into any provider via the constructor:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseConfiguration } from './database.configuration';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly dbConfig: DatabaseConfiguration) {
    this.logger.log(
      `Connecting to database at ${dbConfig.host}:${dbConfig.port}`,
    );
  }
}
```

---

## Default Values

You can provide fallback values in two ways:

**Option 1 — Variable expansion syntax (in the config file):**

```bash
# .env
APP_CLIENT_ID=${NON_EXISTING_VAR:-DEFAULT_ID}  # resolves to DEFAULT_ID
```

**Option 2 — `@Value()` decorator option:**

```typescript
@Configuration()
export class DatabaseConfiguration {
  @Value('DB_HOST', { default: 'localhost' })
  host: string;

  @Value('DB_PORT', { parse: parseInt, default: 3306 })
  port: number;
}
```

---

## Variable Expansion

configify supports variable expansion in config files, including cross-variable references and default fallbacks:

```bash
# .env
MY_SECRET=TEST
MY_API_KEY=${MY_SECRET}              # resolves to: TEST
APP_CLIENT_ID=${NON_EXISTING:-DEFAULT_ID}  # resolves to: DEFAULT_ID
```

---

## Parsing Configuration Values

Use the `parse` option to transform raw string values into the types your application needs:

```yaml
# application.yml
db-json-config: |
  {
    "host": "localhost",
    "user": "test",
    "password": "test"
  }
```

```typescript
interface DbConfig {
  host: string;
  user: string;
  password: string;
}

@Configuration()
export class DatabaseConfiguration {
  @Value('db-json-config', { parse: JSON.parse })
  dbConfig: DbConfig;
}
```

The `parse` option accepts any function with the signature `(value: string) => T`, so you can use built-ins like `parseInt`, `JSON.parse`, or your own custom parser.

---

## Validating Configuration

Use [`class-validator`](https://github.com/typestack/class-validator) decorators alongside `@Value()` to validate configuration at startup — before your application begins serving requests:

```bash
npm install --save class-validator
```

```typescript
import { IsEmail, IsNotEmpty, IsUrl } from 'class-validator';
import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class NotificationConfiguration {
  @IsEmail()
  @Value('SENDER_EMAIL')
  senderEmail: string;

  @IsNotEmpty()
  @Value('API_TOKEN')
  apiToken: string;

  @IsUrl()
  @Value('WEBHOOK_URL')
  webhookUrl: string;
}
```

If validation fails, the application will throw an error on startup with a clear message describing which values are missing or invalid.

---

## Secrets Management

configify has built-in support for resolving secrets from external providers:

| Provider                    | Notes                                      |
| --------------------------- | ------------------------------------------ |
| AWS Secrets Manager         |                                            |
| AWS Parameter Store         |                                            |
| Azure Key Vault             |                                            |
| Bitwarden Secrets Manager   |                                            |
| Google Cloud Secret Manager |                                            |
| Custom resolver             | Implement your own `ConfigurationResolver` |

See the [examples directory](/examples/) for provider-specific setup instructions.

---

## Overriding Default Options

Pass an options object to `forRootAsync()` to customize module behavior:

```typescript
ConfigifyModule.forRootAsync({
  // Ignore all config files (.env, application.yml, application.json)
  // Default: false
  ignoreConfigFile: false,

  // Ignore environment variables
  // Default: false
  ignoreEnvVars: false,

  // Path(s) to configuration files (overrides default discovery)
  configFilePath: './config/app.yml',
  // or multiple files:
  // configFilePath: ['./config/database.yml', './config/app.env'],

  // Enable/disable variable expansion
  // Default: true
  expandConfig: true,

  // Custom secrets resolver strategies
  secretsResolverStrategies: [],
});
```

## License

This code is licensed under the [MIT License](./LICENSE.txt).

All files located in the node_modules and external directories are externally maintained libraries used by this software which have their own licenses; we recommend you read them, as their terms may differ from the terms in the MIT License.
