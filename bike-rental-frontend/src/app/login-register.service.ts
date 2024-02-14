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
  private registerURL = this.baseServerURL + ':3000/registration';
  private tryUserURL = this.baseServerURL + ':3000/login/tryuser';
  private tryAdminURL = this.baseServerURL + ':3000/login/tryadmin';

  constructor(private http: HttpClient) {this.token = "asd"; }
  
  register(registerData: any): Observable<any> {
    return this.http.post(this.registerURL, registerData);
  }

  login(loginData: any): Observable<any> {
    return this.http.post(this.loginURL, loginData).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.setToken(response.token);
          
          const token = this.getToken();
          if (!token) {
            // Handle case where token is not available
            return { ...response, type: 'Unknown' };
          }
  
          const httpOptions = {
            headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
          };
  
          this.http.get(this.tryUserURL, httpOptions).subscribe(
            (userResponse: any) => {
              if (userResponse && userResponse.status === 200) {
                response.tipus = 'User';
              } else {
                // User check failed, try admin type
                this.http.get(this.tryAdminURL, httpOptions).subscribe(
                  (adminResponse: any) => {
                    if (adminResponse && adminResponse.status === 200) {
                      response.tipus = 'Admin';
                    } else {
                      response.tipus = 'Unknown';
                    }
                  },
                  (adminError) => {
                    console.error('Error checking admin type:', adminError);
                  }
                );
              }
            },
            (userError) => {
              if (userError.status === 200) {
                // The response is actually successful despite being indicated as an error
                response.tipus = 'User';
              } else {
                // User check failed, try admin type
                this.http.get(this.tryAdminURL, httpOptions).subscribe(
                  (adminResponse: any) => {
                    if (adminResponse && adminResponse.status === 200) {
                      response.tipus = 'Admin';
                    } else {
                      response.tipus = 'Unknown';
                    }
                  },
                  (adminError) => {
                    console.error('Error checking admin type:', adminError);
                    console.log('infos:', adminError.status);
                    if (adminError && adminError.status === 200) {
                      response.tipus = 'Admin';
                    } else {
                      response.tipus = 'Unknown';
                    }
                  }
                );
              }
            }
          );
        }
      })
    );
  }
  

  

  

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token); // Store token in localStorage
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    this.token = "out";
    localStorage.removeItem('token');
    // Add logic for any additional cleanup or redirection after logout
  }
  
}

