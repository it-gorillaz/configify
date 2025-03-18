import { ConfigifyModule } from '@itgorillaz/configify';
import { GoogleCloudSecretsResolverFactory } from '@itgorillaz/configify/configuration/resolvers/gcp';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
