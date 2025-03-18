import { ConfigifyModule } from '@itgorillaz/configify';
import { AzureKeyVaultConfigurationResolverFactory } from '@itgorillaz/configify/configuration/resolvers/azure';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
