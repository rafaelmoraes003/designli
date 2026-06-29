import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Alert, AlertSchema } from './entities/alert.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Alert.name, schema: AlertSchema }])
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule { }
