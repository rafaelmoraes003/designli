import { Test, TestingModule } from '@nestjs/testing';
import { AlertCheckerService } from './alert-checker.service';

describe('AlertCheckerService', () => {
  let service: AlertCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertCheckerService],
    }).compile();

    service = module.get<AlertCheckerService>(AlertCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
