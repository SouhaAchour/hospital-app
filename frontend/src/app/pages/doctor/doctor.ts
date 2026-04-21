import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor.html',
  styleUrls: ['./doctor.css']
})
export class Doctor implements OnInit {
  userName = '';
  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      const name = localStorage.getItem('userName');

      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      if (role !== 'doctor') {
        this.router.navigate(['/requests']);
        return;
      }

      this.userName = name || '';
    }
  }

  goToRequests() {
    this.router.navigate(['/requests']);
  }

  goToCreateRequest() {
    this.router.navigate(['/create-request']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    this.router.navigate(['/login']);
  }
}