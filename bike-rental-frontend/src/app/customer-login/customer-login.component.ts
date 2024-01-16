import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './customer-login.component.html',
  styleUrl: './customer-login.component.css'
})
export class CustomerLoginComponent {
  loginData = { username: '', password: '' };
  registerData = { username: '', password: '', confirmPassword: '' };

  login(): void {
    console.log('Login Data:', this.loginData);
    // Here you would call a service to interact with your backend
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
