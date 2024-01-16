import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRentalViewComponent } from './customer-rental-view.component';

describe('CustomerRentalViewComponent', () => {
  let component: CustomerRentalViewComponent;
  let fixture: ComponentFixture<CustomerRentalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRentalViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerRentalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
