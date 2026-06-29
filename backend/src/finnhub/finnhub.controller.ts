import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FinnhubService } from './finnhub.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('finnhub')
@UseGuards(JwtAuthGuard)
export class FinnhubController {
  constructor(private readonly finnhubService: FinnhubService) { }

  @Get('quote/:symbol')
  getQuote(@Param('symbol') symbol: string) {
    return this.finnhubService.getQuote(symbol);
  }

  @Get('stocks')
  getStocks() {
    return this.finnhubService.getStocks();
  }

  @Get('quotes')
  getMultipleQuotes(@Query('symbols') symbols: string) {
    return this.finnhubService.getMultipleQuotes(symbols.split(','));
  }
}