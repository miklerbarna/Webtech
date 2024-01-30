import { TestBed } from '@angular/core/testing';

import { CustomerRentalViewService } from './customer-rental-view.service';

describe('CustomerRentalViewService', () => {
  let service: CustomerRentalViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerRentalViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
