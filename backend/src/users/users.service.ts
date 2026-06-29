import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async findByName(name: string): Promise<User | null> {
        const user = await this.userModel.findOne({ name }).exec();
        return user;
    }

    async validateUser(loginUserDto: LoginUserDto): Promise<User> {
        const user = await this.findByName(loginUserDto.name);

        if (!user) {
            throw new NotFoundException("user not found.");
        }

        const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException("invalid password.");
        }

        return user;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = await this.findByName(createUserDto.name);

        if (user) {
            throw new ConflictException("user already exists.");
        }

        const hashed: string = await bcrypt.hash(createUserDto.password, 10);
        const newUser = new this.userModel({ ...createUserDto, password: hashed });
        return newUser.save();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { fcmToken }).exec();
    }
}
