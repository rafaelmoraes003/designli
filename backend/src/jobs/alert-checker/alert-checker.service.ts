import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertsService } from '../../alerts/alerts.service';
import { FinnhubService } from '../../finnhub/finnhub.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AlertCheckerService {
    private readonly logger = new Logger(AlertCheckerService.name);

    constructor(
        private alertsService: AlertsService,
        private finnhubService: FinnhubService,
        private firebaseService: FirebaseService,
        private usersService: UsersService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async checkAlerts() {
        this.logger.log('Checking alerts...');

        const pendingAlerts = await this.alertsService.findPendingAlerts();

        for (const alert of pendingAlerts) {
            try {
                const quote = await this.finnhubService.getQuote(alert.symbol);
                const currentPrice = quote.c;

                if (currentPrice >= alert.targetPrice) {
                    const user = await this.usersService.findById(alert.userId.toString());

                    if (user?.fcmToken) {
                        await this.firebaseService.sendNotification(
                            user.fcmToken,
                            alert.symbol,
                            currentPrice,
                            alert.targetPrice,
                        );
                    }

                    await this.alertsService.markAsTriggered(alert['_id'].toString());
                }
            } catch (error: any) {
                this.logger.error(`Error checking alert for ${alert.symbol}: ${error.message}`);
            }
        }
    }
}