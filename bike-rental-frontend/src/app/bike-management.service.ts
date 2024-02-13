import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BikeManagementService {
    
    private baseServerURL = "http://localhost";

    private getAllBikesURL = this.baseServerURL + ':3000/bikes';
    private getAllCategoriesURL = this.baseServerURL + ':3000/categories';
    private getAllModelsURL = this.baseServerURL + ':3000/models';
    private bikeURL = this.baseServerURL + ':3000/bike';
    private categoryURL = this.baseServerURL + ':3000/category';
    private modelURL = this.baseServerURL + ':3000/model';

    constructor(private http: HttpClient) { }
    
  
    getBikes(): Observable<any[]> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
      };
      return this.http.get<any[]>(this.getAllBikesURL, httpOptions);
    }
    getCategories(): Observable<any[]> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
      };
      return this.http.get<any[]>(this.getAllCategoriesURL, httpOptions);
    }
    getModels(): Observable<any[]> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
      };
      return this.http.get<any[]>(this.getAllModelsURL, httpOptions);
    }

    deleteBike(bikeId: string): Observable<any> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` }),
        body: { bike_id: bikeId }
      };
      return this.http.delete(this.bikeURL, httpOptions);
    }

    deleteCategory(categoryId: string): Observable<any> {
      
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': `Bearer ${this.getToken()}` }),
        body: { id: categoryId }
      };
      return this.http.delete(this.categoryURL, httpOptions);
      
    }
    deleteModel(modelId: string): Observable<any> {
      console.log("Delete Model" + modelId);
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': `Bearer ${this.getToken()}` }),
        body: { model_id: modelId }
      };
      return this.http.delete(this.modelURL, httpOptions);
      
    }

    editCategory(categoryId: string, newName: string): Observable<any> {
      const body = { id: categoryId, name: newName }; // Request body
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': `Bearer ${this.getToken()}` }),
      };
      return this.http.put(this.categoryURL, body, httpOptions);
      
    }

    editModel(updatedModel: any): Observable<any> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': `Bearer ${this.getToken()}` }),
      };
      return this.http.put(this.modelURL, updatedModel, httpOptions);
      
    }

    editBike(updatedBike: any): Observable<any> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': `Bearer ${this.getToken()}` }),
      };
      return this.http.put(this.bikeURL, updatedBike, httpOptions);
      
    }

    addCategory(categoryName: string): Observable<any> {
      const body = { name: categoryName };
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': `Bearer ${this.getToken()}` }),
      };
      return this.http.post(this.categoryURL, body, httpOptions);
      
    }

    addBike(newBike: any): Observable<any> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': `Bearer ${this.getToken()}` }),
      };
      return this.http.post(this.bikeURL, newBike, httpOptions);
      
    }

    addModel(newModel: any): Observable<any> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': `Bearer ${this.getToken()}` }),
      };
      return this.http.post(this.modelURL, newModel, httpOptions);
      
    }

    private getToken(): string | null {
      return localStorage.getItem('token');
    }
    
}
