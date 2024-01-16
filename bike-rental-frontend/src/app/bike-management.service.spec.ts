import { TestBed } from '@angular/core/testing';

import { BikeManagementService } from './bike-management.service';

describe('BikeManagementService', () => {
  let service: BikeManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BikeManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
