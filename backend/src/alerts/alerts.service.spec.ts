import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AlertsService } from './alerts.service';

const mockAlertModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

describe('AlertsService', () => {
  let service: AlertsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AlertsService(mockAlertModel as any);
  });

  describe('findAllByUser', () => {
    it('should return all alerts for a user', async () => {
      const alerts = [{ symbol: 'AAPL', targetPrice: 200 }];
      mockAlertModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(alerts) });

      expect(await service.findAllByUser('user-123')).toEqual(alerts);
      expect(mockAlertModel.find).toHaveBeenCalledWith({ userId: 'user-123' });
    });

    it('should return empty array if no alerts found', async () => {
      mockAlertModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

      expect(await service.findAllByUser('user-123')).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create an alert successfully', async () => {
      const dto = { symbol: 'AAPL', targetPrice: 200 };
      const saved = { ...dto, userId: 'user-123', triggered: false };
      const mockSave = jest.fn().mockResolvedValue(saved);

      service['alertModel'] = jest.fn().mockImplementation(() => ({ save: mockSave })) as any;

      const result = await service.create('user-123', dto);

      expect(result).toEqual(saved);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if alert does not exist', async () => {
      mockAlertModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.delete('user-123', 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockAlertModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ userId: { toString: () => 'other-user' } }),
      });

      await expect(service.delete('user-123', 'alert-id')).rejects.toThrow(ForbiddenException);
    });

    it('should delete alert successfully', async () => {
      mockAlertModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ userId: { toString: () => 'user-123' } }),
      });
      mockAlertModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.delete('user-123', 'alert-id')).resolves.toBeUndefined();
    });
  });

  describe('markAsTriggered', () => {
    it('should mark alert as triggered', async () => {
      mockAlertModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.markAsTriggered('alert-id')).resolves.toBeUndefined();
      expect(mockAlertModel.findByIdAndUpdate).toHaveBeenCalledWith('alert-id', { triggered: true });
    });
  });

  describe('findPendingAlerts', () => {
    it('should return only non-triggered alerts', async () => {
      const alerts = [{ symbol: 'AAPL', triggered: false }];
      mockAlertModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(alerts) });

      expect(await service.findPendingAlerts()).toEqual(alerts);
      expect(mockAlertModel.find).toHaveBeenCalledWith({ triggered: false });
    });
  });
});