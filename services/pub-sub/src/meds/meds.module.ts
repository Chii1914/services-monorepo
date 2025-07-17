import { Module } from '@nestjs/common';
import { MedsController } from './meds.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [ClientsModule.register([
    {
      name: 'redis',
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_PASSWORD,
      },
    },
  ]),],
  controllers: [MedsController],
  providers: [],
})
export class MedsModule { }
