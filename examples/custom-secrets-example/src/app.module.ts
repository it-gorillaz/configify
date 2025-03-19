import {
  ConfigifyModule,
  RemoteConfigurationResolver,
} from '@itgorillaz/configify';
import { Module } from '@nestjs/common';
import * as Axios from 'axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomConfigurationResolver } from './custom-configuration.resolver';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      secretsResolverStrategies: [
        new RemoteConfigurationResolver(
          new CustomConfigurationResolver(
            process.env.MOCK_SERVER_URL ||
              'http://mockserver-configify:1080/secrets',
            Axios.default,
          ),
        ),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
