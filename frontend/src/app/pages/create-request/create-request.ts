import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './create-request.html',
  styleUrls: ['./create-request.css']
})
export class CreateRequest implements OnInit {
  patient_id = '';
  exam_type_id = '';
  clinical_information = '';
  urgency_level = '';
  successMessage = '';
  errorMessage = '';

  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');

      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      if (role !== 'doctor') {
        this.router.navigate(['/requests']);
        return;
      }
    }
  }

createRequest() {
  this.successMessage = '';
  this.errorMessage = '';

  if (!isPlatformBrowser(this.platformId)) return;

  const token = localStorage.getItem('token');

  if (!token) {
    this.router.navigate(['/login']);
    return;
  }

  const headers = new HttpHeaders({
    Authorization: token
  });

  this.http.post('http://localhost:8000/api/requests', {
    patient_id: Number(this.patient_id),
    exam_type_id: Number(this.exam_type_id),
    clinical_information: this.clinical_information,
    urgency_level: this.urgency_level
  }, { headers }).subscribe({
    next: () => {
      this.successMessage = 'Prescription créée avec succès';
      this.errorMessage = '';

      this.patient_id = '';
      this.exam_type_id = '';
      this.clinical_information = '';
      this.urgency_level = '';

      setTimeout(() => {
        this.router.navigate(['/requests']);
      }, 1000);
    },

    error: (error) => {
      console.log('CREATE REQUEST ERROR:', error);
      this.successMessage = '';
      this.errorMessage = error.error?.message || 'Erreur lors de la création';
    }
  });
}

  goToDoctorHome() {
    this.router.navigate(['/doctor']);
  }
}