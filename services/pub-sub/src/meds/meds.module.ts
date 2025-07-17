import { Module } from '@nestjs/common';
import { MedsController } from './meds.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { EventsGateway } from '../events/events.gateway'; // <-- ADDED IMPORT

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


@Module({
  imports: [ClientsModule.register([
    {
      name: 'redis',
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
      },
    },
  ]),],
  controllers: [MedsController],
  providers: [EventsGateway],
})
export class MedsModule { }
