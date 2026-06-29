import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AlertsModule } from './alerts/alerts.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FinnhubModule } from './finnhub/finnhub.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertCheckerService } from './jobs/alert-checker/alert-checker.service';
import { JobsModule } from './jobs/jobs.module';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL || "mongodb://mongo:QOEIcUIEPsmHPRsWMdxCIsZriIUlOXNa@acela.proxy.rlwy.net:48870"),
    UsersModule,
    AlertsModule,
    AuthModule,
    FinnhubModule,
    JobsModule
  ],
  controllers: [AppController],
  providers: [AppService, AlertCheckerService, FirebaseService],
})

export class AppModule { }
