import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

const mockUsersService = {
  create: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const dto: CreateUserDto = { name: 'rafael', password: 'Senha@123' };
    const result = { _id: 'some-id', name: 'rafael', password: 'hashed' };

    mockUsersService.create.mockResolvedValue(result);

    expect(await controller.create(dto)).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should throw ConflictException if user already exists', async () => {
    const dto: CreateUserDto = { name: 'rafael', password: 'Senha@123' };

    mockUsersService.create.mockRejectedValue(new ConflictException('user already exists.'));

    await expect(controller.create(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw if name is too short', async () => {
    const dto: CreateUserDto = { name: 'raf', password: 'Senha@123' };

    mockUsersService.create.mockRejectedValue(new Error('name must have at least 5 characters'));

    await expect(controller.create(dto)).rejects.toThrow('name must have at least 5 characters');
  });

  it('should throw if password has no uppercase', async () => {
    const dto: CreateUserDto = { name: 'rafael', password: 'senha@123' };

    mockUsersService.create.mockRejectedValue(new Error('password must contain uppercase, lowercase, number and symbol'));

    await expect(controller.create(dto)).rejects.toThrow('password must contain uppercase, lowercase, number and symbol');
  });

  it('should throw if password has no symbol', async () => {
    const dto: CreateUserDto = { name: 'rafael', password: 'Senha1234' };

    mockUsersService.create.mockRejectedValue(new Error('password must contain uppercase, lowercase, number and symbol'));

    await expect(controller.create(dto)).rejects.toThrow('password must contain uppercase, lowercase, number and symbol');
  });

  it('should throw if password is missing', async () => {
    const dto = { name: 'rafael' } as CreateUserDto;

    mockUsersService.create.mockRejectedValue(new Error());

    await expect(controller.create(dto)).rejects.toThrow();
  });
});