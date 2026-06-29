import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';

const mockAlertsService = {
  findAllByUser: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

const mockRequest = { user: { userId: 'user-123' } };

describe('AlertsController', () => {
  let controller: AlertsController;
  let service: AlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [
        { provide: AlertsService, useValue: mockAlertsService },
      ],
    }).compile();

    controller = module.get<AlertsController>(AlertsController);
    service = module.get<AlertsService>(AlertsService);

    jest.clearAllMocks();
  });

  describe('GET /alerts', () => {
    it('should return all alerts for the logged user', async () => {
      const result = [{ symbol: 'AAPL', targetPrice: 200 }];
      mockAlertsService.findAllByUser.mockResolvedValue(result);

      expect(await controller.findAll(mockRequest)).toEqual(result);
      expect(service.findAllByUser).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array if user has no alerts', async () => {
      mockAlertsService.findAllByUser.mockResolvedValue([]);

      expect(await controller.findAll(mockRequest)).toEqual([]);
    });
  });

  describe('POST /alerts', () => {
    it('should create an alert successfully', async () => {
      const dto: CreateAlertDto = { symbol: 'AAPL', targetPrice: 200 };
      const result = { _id: 'alert-id', userId: 'user-123', ...dto, triggered: false };

      mockAlertsService.create.mockResolvedValue(result);

      expect(await controller.create(mockRequest, dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith('user-123', dto);
    });

    it('should throw if symbol is missing', async () => {
      const dto = { targetPrice: 200 } as CreateAlertDto;
      mockAlertsService.create.mockRejectedValue(new Error());

      await expect(controller.create(mockRequest, dto)).rejects.toThrow();
    });

    it('should throw if targetPrice is missing', async () => {
      const dto = { symbol: 'AAPL' } as CreateAlertDto;
      mockAlertsService.create.mockRejectedValue(new Error());

      await expect(controller.create(mockRequest, dto)).rejects.toThrow();
    });

    it('should throw if symbol is lowercase', async () => {
      const dto = { symbol: 'aapl', targetPrice: 200 } as CreateAlertDto;
      mockAlertsService.create.mockRejectedValue(new Error('symbol must be uppercase'));

      await expect(controller.create(mockRequest, dto)).rejects.toThrow('symbol must be uppercase');
    });

    it('should throw if symbol is longer than 5 characters', async () => {
      const dto = { symbol: 'TOOLONG', targetPrice: 200 } as CreateAlertDto;
      mockAlertsService.create.mockRejectedValue(new Error('symbol must be between 1 and 5 characters'));

      await expect(controller.create(mockRequest, dto)).rejects.toThrow('symbol must be between 1 and 5 characters');
    });

    it('should throw if targetPrice is 0 or negative', async () => {
      const dto: CreateAlertDto = { symbol: 'AAPL', targetPrice: 0 };
      mockAlertsService.create.mockRejectedValue(new Error('targetPrice must be greater than 0'));

      await expect(controller.create(mockRequest, dto)).rejects.toThrow('targetPrice must be greater than 0');
    });
  });

  describe('DELETE /alerts/:id', () => {
    it('should delete an alert successfully', async () => {
      mockAlertsService.delete.mockResolvedValue(undefined);

      await expect(controller.delete(mockRequest, 'alert-id')).resolves.toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith('user-123', 'alert-id');
    });

    it('should throw NotFoundException if alert does not exist', async () => {
      mockAlertsService.delete.mockRejectedValue(new NotFoundException('alert not found.'));

      await expect(controller.delete(mockRequest, 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockAlertsService.delete.mockRejectedValue(new ForbiddenException('you can only delete your own alerts.'));

      await expect(controller.delete(mockRequest, 'alert-id')).rejects.toThrow(ForbiddenException);
    });
  });
});