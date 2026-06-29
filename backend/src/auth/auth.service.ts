import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(loginUserDto: LoginUserDto) {
        const user = await this.userService.validateUser(loginUserDto);

        const payload = {
            sub: user['_id'],
            name: user.name
        };

        return { token: this.jwtService.sign(payload) };
    }
}
