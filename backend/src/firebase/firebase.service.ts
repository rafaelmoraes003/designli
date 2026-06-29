import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
    private readonly logger = new Logger(FirebaseService.name);

    constructor() {
        if (!getApps().length) {
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }
    }

    async sendNotification(
        fcmToken: string,
        symbol: string,
        currentPrice: number,
        targetPrice: number,
    ) {
        try {
            await getMessaging().send({
                token: fcmToken,
                notification: {
                    title: `${symbol} atingiu o preço alvo!`,
                    body: `Preço atual: $${currentPrice} | Seu alerta: $${targetPrice}`,
                },
                data: {
                    symbol,
                    currentPrice: currentPrice.toString(),
                    targetPrice: targetPrice.toString(),
                },
            });

            this.logger.log(`Notification sent for ${symbol}`);
        } catch (error: any) {
            this.logger.error(`Error sending notification: ${error.message}`);
        }
    }
}