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

  constructor(private http: HttpClient) { }

  getBikeStations(): Observable<any[]> {
    return this.http.get<any[]>(this.getAllStationsURL);
  }

  addBikeStation(newStation: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
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
  
  

}


