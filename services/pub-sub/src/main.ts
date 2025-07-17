import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.PUB_SUB_PORT) {
    throw new Error('REDIS_HOST, REDIS_PORT, and PUB_SUB_PORT environment variables must be set');
  }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD,
    },
  });

  // Start both the HTTP server and the microservice listeners.
  await app.startAllMicroservices();
  const httpPort = parseInt(process.env.PUB_SUB_PORT, 10);
  await app.listen(httpPort, () => {
    console.log(`NestJS Pub/Sub Service en ${httpPort} Redis conectado`);
  });
}
bootstrap();