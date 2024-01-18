import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class BikeStationService {
  private mockBikeStations = [
    {
      id: 1,
      name: 'Central Station',
      address: '123 Main St, Klagenfurt',
      latitude: 46.62472,
      longitude: 14.30528,
      parkingPlaces: [
        { id: 1, type: 'e-bike', capacity: 10 },
        { id: 2, type: 'children bike', capacity: 8 },
        { id: 3, type: 'mountain bike', capacity: 5 },
        { id: 4, type: 'universal', capacity: 15 }
      ],
      reviews: [
        { userId: 101, rating: 4, comment: 'Great location and variety of bikes.' },
        { userId: 102, rating: 5, comment: 'Always found a bike when needed, excellent service.' }
      ]
    },
    {
      id: 2,
      name: 'Lake Side Station',
      address: '456 Lake Rd, Klagenfurt',
      latitude: 47.37956,
      longitude: 14.27459,
      parkingPlaces: [
        { id: 1, type: 'e-bike', capacity: 12 },
        { id: 2, type: 'city bike', capacity: 10 },
        { id: 3, type: 'universal', capacity: 20 }
      ],
      reviews: [
        { userId: 103, rating: 3, comment: 'Good location, but often crowded.' },
        { userId: 104, rating: 4, comment: 'Nice view of the lake while picking up a bike.' }
      ]
    },
    
  ];

  private apiUrl = 'http://localhost:3000/stations'; // Backend API URL

  constructor(private http: HttpClient) { }

  getBikeStations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addBikeStation(newStation: any): void {
    const newId = this.mockBikeStations.length > 0 ? Math.max(...this.mockBikeStations.map(s => s.id)) + 1 : 1;
    newStation.id = newId;
    this.mockBikeStations.push(newStation);
  }
  
  updateBikeStation(updatedStation: any): void {
    const index = this.mockBikeStations.findIndex(s => s.id === updatedStation.id);
    if (index > -1) {
      this.mockBikeStations[index] = updatedStation;
    }
  }

  deleteBikeStation(stationId: number): void {
    this.mockBikeStations = this.mockBikeStations.filter(s => s.id !== stationId);
  }
  
  

}


