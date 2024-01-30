// customer-rental-view.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BikeStationService } from './bike-station.service'; // Adjust the path as necessary

@Injectable({
  providedIn: 'root'
})
export class CustomerRentalViewService {

  constructor(private bikeStationService: BikeStationService) { }

  getBikeStations(): Observable<any[]> {
    return this.bikeStationService.getBikeStations();
  }
}
