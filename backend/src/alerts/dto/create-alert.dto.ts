import { IsString, IsNumber, IsUppercase, Length, Min } from "class-validator";

export class CreateAlertDto {
    @IsString()
    @IsUppercase({ message: 'symbol must be uppercase' })
    @Length(1, 5, { message: 'symbol must be between 1 and 5 characters' })
    symbol: string;

    @IsNumber()
    @Min(0.01, { message: 'targetPrice must be greater than 0' })
    targetPrice: number;
}