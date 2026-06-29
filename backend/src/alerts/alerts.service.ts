import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
    constructor(@InjectModel(Alert.name) private alertModel: Model<AlertDocument>) { }

    async findAllByUser(userId: string): Promise<Alert[]> {
        return this.alertModel.find({ userId }).exec();
    }

    async create(userId: string, createAlertDto: CreateAlertDto): Promise<Alert> {
        const alert = new this.alertModel({ ...createAlertDto, userId, triggered: false });
        return alert.save();
    }

    async delete(userId: string, alertId: string): Promise<void> {
        const alert = await this.alertModel.findById(alertId).exec();

        if (!alert) {
            throw new NotFoundException('alert not found.');
        }

        if (alert.userId.toString() !== userId) {
            throw new ForbiddenException('you can only delete your own alerts.');
        }

        await this.alertModel.findByIdAndDelete(alertId).exec();
    }

    async markAsTriggered(alertId: string): Promise<void> {
        await this.alertModel.findByIdAndUpdate(alertId, { triggered: true }).exec();
    }

    async findPendingAlerts(): Promise<Alert[]> {
        return this.alertModel.find({ triggered: false }).exec();
    }
}