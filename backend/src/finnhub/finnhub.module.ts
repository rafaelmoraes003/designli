import { Module } from '@nestjs/common';
import { FinnhubService } from './finnhub.service';
import { FinnhubController } from './finnhub.controller';

@Module({
  providers: [FinnhubService],
  controllers: [FinnhubController],
  exports: [FinnhubService],
})
export class FinnhubModule { }