import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService {
  private token: string;

  private baseServerURL = "http://localhost";

  private loginURL = this.baseServerURL + ':3000/login';

  constructor(private http: HttpClient) {this.token = "asd"; }
  
  login(loginData: any): Observable<any> {
    return this.http.post(this.loginURL, loginData).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.setToken(response.token);
        }
      })
    );
  }
  

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token); // Store token in localStorage
  }


  logout(): void {
    this.token = "out";
    localStorage.removeItem('token');
    // Add logic for any additional cleanup or redirection after logout
  }
  
}

