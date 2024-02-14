import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRegisterService } from '../login-register.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './customer-login.component.html',
  styleUrl: './customer-login.component.css'
})
export class CustomerLoginComponent {

  constructor(
    
    private loginRegisterService: LoginRegisterService,
    private router: Router 
    ) { }

  loginData = { username: '', password: '' };
  registerData = { username: '', password: '', confirmPassword: '' };

  login(): void {
    console.log('Login Data:', this.loginData);
    let loginData: {[key: string]: any} = {};
    loginData['email'] = this.loginData.username;
    loginData['password'] = this.loginData.password;

    this.loginRegisterService.login(loginData).subscribe(
      response => {
        console.log('Login success!', response);
        const userType = response.account_type;
        console.log("Logged in with type: " + userType);
        if (userType === 'admin') {
          this.router.navigate(['/management']);
        } else {
          this.router.navigate(['/customerrental']);
        }
      },
      error => {
        console.error('Login failed!', error);
      }
    );

  }

  register(): void {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Register Data:', this.registerData);
    let registerDataBody: {[key: string]: any} = {};
    registerDataBody['email'] = this.registerData.username;
    registerDataBody['password'] = this.registerData.password;

    this.loginRegisterService.register(registerDataBody).subscribe(
      response => {
        console.log('Register success!', response);
        const userType = response.account_type;
        console.log("Logged in with type: " + userType);
        if (userType === 'admin') {
          this.router.navigate(['/management']);
        } else {
          this.router.navigate(['/customerrental']);
        }
      },
      error => {
        console.error('Login failed!', error.status);
        if (error.status == 200){
            alert("Registered successfully! Please log in.");
        }
      }
    );


  }
}
