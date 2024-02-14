import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class BikeStationService {
  private mockBikeStations = [];

  private baseServerURL = "http://localhost";
  private getAllStationsURL = this.baseServerURL + ':3000/stations';
  private stationURL = this.baseServerURL + ':3000/station';
  private getAllCategoriesURL = this.baseServerURL + ':3000/categories';
  private postStationReviewURL = this.baseServerURL + ':3000/review/station';
  

  constructor(private http: HttpClient) { }

  getBikeStations(): Observable<any[]> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
    };
    console.log("Sending token: " + this.getToken());
    return this.http.get<any[]>(this.getAllStationsURL, httpOptions);
  }

  addBikeStation(newStation: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}`  })
    };
    return this.http.post(this.stationURL, newStation, httpOptions);
  }
  
  editBikeStation(updatedStation: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put(this.stationURL, updatedStation, httpOptions);
    
  }

  deleteBikeStation(stationId: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: { station_id: stationId }
    };
    return this.http.delete(this.stationURL, httpOptions);
  }
  
  getCategories(): Observable<any[]> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}`  })
    };
    return this.http.get<any[]>(this.getAllCategoriesURL, httpOptions);
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  postStationReview(review: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}`  })
    };
    return this.http.post(this.postStationReviewURL, review, httpOptions);
  }

}


