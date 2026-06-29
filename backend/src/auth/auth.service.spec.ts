import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

const mockUsersService = {
  validateUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockUsersService as any, mockJwtService as any);
  });

  it('should return a token on successful login', async () => {
    const user = { _id: 'some-id', name: 'rafael' };

    mockUsersService.validateUser.mockResolvedValue(user);
    mockJwtService.sign.mockReturnValue('jwt-token');

    const result = await service.login({ name: 'rafael', password: 'Senha@123' });

    expect(result).toEqual({ token: 'jwt-token' });
    expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 'some-id', name: 'rafael' });
  });

  it('should throw NotFoundException if user does not exist', async () => {
    mockUsersService.validateUser.mockRejectedValue(new NotFoundException('user not found.'));

    await expect(service.login({ name: 'joao', password: 'Senha@123' }))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw UnauthorizedException if password is wrong', async () => {
    mockUsersService.validateUser.mockRejectedValue(new UnauthorizedException('invalid password.'));

    await expect(service.login({ name: 'rafael', password: 'Senha@456' }))
      .rejects.toThrow(UnauthorizedException);
  });
});