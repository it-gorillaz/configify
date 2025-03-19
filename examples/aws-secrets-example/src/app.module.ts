import { ConfigifyModule } from '@itgorillaz/configify';
import { AwsSecretsResolverFactory } from '@itgorillaz/configify/configuration/resolvers/aws';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
