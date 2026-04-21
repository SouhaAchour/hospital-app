import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './requests.html',
  styleUrls: ['./requests.css'],
})
export class Requests implements OnInit {
  requests: any[] = [];
  loading = true;
  userName = '';
  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Requests ngOnInit');

    if (!isPlatformBrowser(this.platformId)) {
      console.log('Not in browser');
      this.loading = false;
      return;
    }

    const token = localStorage.getItem('token');
    console.log('TOKEN:', token);

    if (!token) {
      console.log('No token, redirect to login');
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.userName = localStorage.getItem('userName') || '';

    const headers = new HttpHeaders({
      Authorization: token
    });

    this.http.get<any[]>('http://localhost:8000/api/requests', { headers }).subscribe({
      next: (res) => {
        console.log('API RESPONSE:', res);
        this.requests = Array.isArray(res) ? res : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('API ERROR:', error);
        this.loading = false;

        if (error.status === 401 || error.status === 403) {
          this.logout();
          return;
        }

        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    this.router.navigate(['/login']);
  }
}