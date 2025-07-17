import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MedsModule } from './meds/meds.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables for the client configuration as well
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
  throw new Error('REDIS_HOST and REDIS_PORT environment variables must be set');
}
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'redis', 
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT, 10),
          password: process.env.REDIS_PASSWORD,
        },
      },
    ]),
    MedsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}