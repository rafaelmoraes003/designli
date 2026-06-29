import { IsString } from 'class-validator';

export class LoginUserDto {
    @IsString()
    name: string;

    @IsString()
    password: string;
}