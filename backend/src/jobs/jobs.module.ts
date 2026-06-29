import { Module } from '@nestjs/common';
import { AlertCheckerService } from './alert-checker/alert-checker.service';
import { AlertsModule } from '../alerts/alerts.module';
import { FinnhubModule } from '../finnhub/finnhub.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [AlertsModule, FinnhubModule, FirebaseModule, UsersModule],
    providers: [AlertCheckerService],
})
export class JobsModule { }