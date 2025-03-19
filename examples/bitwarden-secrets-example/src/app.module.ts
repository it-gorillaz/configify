import { ConfigifyModule } from '@itgorillaz/configify';
import {
  BitwardenSecretsResolverFactory,
  BitwardenServerRegion,
} from '@itgorillaz/configify/configuration/resolvers/bitwarden';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
