import { Controller, Post, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard)
  updateFcmToken(@Request() req, @Body('fcmToken') fcmToken: string) {
    return this.usersService.updateFcmToken(req.user.userId, fcmToken);
  }
}