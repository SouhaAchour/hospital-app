import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Requests } from './pages/requests/requests';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';

import { Doctor } from './pages/doctor/doctor';
import { CreateRequest } from './pages/create-request/create-request';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'requests', component: Requests },
  { path: 'doctor', component: Doctor },
  { path: 'create-request', component: CreateRequest }
];