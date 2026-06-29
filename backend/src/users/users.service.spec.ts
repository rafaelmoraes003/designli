import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';

const mockUserModel = {
  findOne: jest.fn(),
  save: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(mockUserModel as any);
  });

  describe('validateUser', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.validateUser({ name: 'rafael', password: 'Senha@123' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'rafael', password: 'wronghash' }),
      });

      await expect(service.validateUser({ name: 'rafael', password: 'Senha@123' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('create', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'rafael' }),
      });

      await expect(service.create({ name: 'rafael', password: 'Senha@123' }))
        .rejects.toThrow(ConflictException);
    });
  });
});