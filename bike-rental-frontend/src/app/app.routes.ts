import { Routes } from '@angular/router';
import { ManagementViewComponent } from './management-view/management-view.component';
import { BikeManagementComponent } from './bike-management/bike-management.component';
import { CustomerLoginComponent } from './customer-login/customer-login.component';
import { CustomerRentalViewComponent } from './customer-rental-view/customer-rental-view.component';

export const routes: Routes = [
    { path: '', redirectTo: '/management', pathMatch: 'full' },
    { path: 'management', component: ManagementViewComponent },
    { path: 'bikes', component: BikeManagementComponent},
    { path: 'customerlogin', component: CustomerLoginComponent},
    { path: 'customerrental', component: CustomerRentalViewComponent},
  ];
  
