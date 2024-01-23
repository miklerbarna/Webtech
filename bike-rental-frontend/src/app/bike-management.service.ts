import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BikeManagementService {
  private mockBikes = [
    {
      id: 'B001',
      category: 'mountain bike',
      model: 'Merida Wulf 7.74',
      stationId: 1,
      parkingSpot: 5,
      reviews: [
        { userId: 201, rating: 4, comment: 'Great performance on rough terrains.' },
        { userId: 202, rating: 5, comment: 'Perfect bike for mountain biking enthusiasts.' }
      ]
    },
    {
      id: 'B002',
      category: 'electric bike',
      model: 'KTM Ultra fun 2019',
      stationId: 2,
      parkingSpot: 3,
      reviews: [
        { userId: 203, rating: 4, comment: 'Excellent battery life and smooth ride.' },
        { userId: 204, rating: 3, comment: 'Good bike but a bit heavy.' }
      ]
    },
    {
      id: 'B003',
      category: 'city bike',
      model: 'CityCruiser 2020',
      stationId: 1,
      parkingSpot: 2,
      reviews: [
        { userId: 205, rating: 5, comment: 'Comfortable for daily commutes.' },
        { userId: 206, rating: 4, comment: 'Stylish and practical.' }
      ]
    },
    {
      id: 'B004',
      category: 'children bike',
      model: 'LittleRider 2018',
      stationId: 3,
      parkingSpot: 7,
      reviews: [
        { userId: 207, rating: 4, comment: 'Safe and reliable for kids.' },
        { userId: 208, rating: 5, comment: 'My kids love it!' }
      ]
    },
    {
      id: 'B005',
      category: 'mountain bike',
      model: 'TrailBlazer X1',
      stationId: 2,
      parkingSpot: 1,
      reviews: [
        { userId: 209, rating: 5, comment: 'Excellent control and durability.' },
        { userId: 210, rating: 4, comment: 'Handles well on tough trails.' }
      ]
    },
    {
      id: 'B006',
      category: 'electric bike',
      model: 'EcoRide 2021',
      stationId: 3,
      parkingSpot: 6,
      reviews: [
        { userId: 211, rating: 4, comment: 'Eco-friendly and efficient.' },
        { userId: 212, rating: 5, comment: 'Impressed by the smooth electric assist.' }
      ]
    },
    {
      id: 'B007',
      category: 'city bike',
      model: 'UrbanExplorer Pro',
      stationId: 1,
      parkingSpot: 4,
      reviews: [
        { userId: 213, rating: 3, comment: 'Good for urban areas, but needs better gear shifting.' },
        { userId: 214, rating: 4, comment: 'A reliable choice for city commutes.' }
      ]
    }
    ];
  
  

    private getAllBikesURL = 'http://localhost:3000/bikes';
    private getAllCategoriesURL = 'http://localhost:3000/categories';
    private getAllModelsURL = 'http://localhost:3000/models';

    constructor(private http: HttpClient) { }
  
    getBikes(): Observable<any[]> {
      return this.http.get<any[]>(this.getAllBikesURL);
    }
    getCategories(): Observable<any[]> {
      return this.http.get<any[]>(this.getAllCategoriesURL);
    }
    getModels(): Observable<any[]> {
      return this.http.get<any[]>(this.getAllModelsURL);
    }
}
