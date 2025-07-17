import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MedsModule } from './meds/meds.module';

@Module({
  imports: [MedsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
