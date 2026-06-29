import { IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MinLength(5, { message: "name must have at least 5 characters" })
    name: string;

    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message: 'password must contain uppercase, lowercase, number and symbol',
    })
    password: string;
}