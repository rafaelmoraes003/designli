import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) { }

  @Get()
  findAll(@Request() req) {
    return this.alertsService.findAllByUser(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(req.user.userId, createAlertDto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') alertId: string) {
    return this.alertsService.delete(req.user.userId, alertId);
  }
}