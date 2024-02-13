import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRegisterService } from '../login-register.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './customer-login.component.html',
  styleUrl: './customer-login.component.css'
})
export class CustomerLoginComponent {

  constructor(
    
    private loginRegisterService: LoginRegisterService    
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
    // Here you would call a service to interact with your backend
  }
}
