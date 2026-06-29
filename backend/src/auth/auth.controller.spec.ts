import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';

const mockAuthService = {
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should return a token on successful login', async () => {
    const dto: LoginUserDto = { name: 'rafael', password: 'Senha@123' };
    const result = { token: 'jwt-token' };

    mockAuthService.login.mockResolvedValue(result);

    expect(await controller.login(dto)).toEqual(result);
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    const dto: LoginUserDto = { name: 'joao', password: 'Senha@123' };

    mockAuthService.login.mockRejectedValue(new NotFoundException('user not found.'));

    await expect(controller.login(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw UnauthorizedException if password is wrong', async () => {
    const dto: LoginUserDto = { name: 'rafael', password: 'Senha@456' };

    mockAuthService.login.mockRejectedValue(new UnauthorizedException('invalid password.'));

    await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if fields are missing', async () => {
    const dto = { name: 'rafael' } as LoginUserDto;

    mockAuthService.login.mockRejectedValue(new Error());

    await expect(controller.login(dto)).rejects.toThrow();
  });
});