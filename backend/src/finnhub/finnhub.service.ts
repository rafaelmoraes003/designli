import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FinnhubService {
    private readonly baseUrl = 'https://finnhub.io/api/v1';
    private readonly apiKey = process.env.FINNHUB_API_KEY;

    async getQuote(symbol: string): Promise<any> {
        const { data } = await axios.get(`${this.baseUrl}/quote`, {
            params: { symbol, token: this.apiKey },
        });
        return data;
    }

    async getStocks(): Promise<any> {
        const { data } = await axios.get(`${this.baseUrl}/stock/symbol`, {
            params: { exchange: 'US', token: this.apiKey },
        });
        return data;
    }

    async getMultipleQuotes(symbols: string[]): Promise<any> {
        const quotes = await Promise.all(
            symbols.map(async (symbol) => {
                const { data } = await axios.get(`${this.baseUrl}/quote`, {
                    params: { symbol, token: this.apiKey },
                });
                return { symbol, ...data };
            })
        );
        return quotes;
    }
}