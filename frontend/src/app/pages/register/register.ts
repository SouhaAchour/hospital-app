import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  private platformId = inject(PLATFORM_ID);

  name = '';
  email = '';
  password = '';
  first_name = '';
  last_name = '';
  date_of_birth = '';
  phone = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

 ngOnInit() {
  if (isPlatformBrowser(this.platformId)) {
    const token = localStorage.getItem('token');

    if (token) {
      this.router.navigate(['/requests']);
    }
  }
}

  register() {
    this.errorMessage = '';

    this.http.post('http://localhost:8000/api/registeruser', {
      name: this.name,
      email: this.email,
      password: this.password,
      first_name: this.first_name,
      last_name: this.last_name,
      date_of_birth: this.date_of_birth,
      phone: this.phone
    }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage = 'Ce compte existe déjà';
        } else if (error.status === 400) {
          this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
        } else {
          this.errorMessage = 'Erreur serveur';
        }
      }
    });
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}