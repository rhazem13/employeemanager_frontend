import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  nonPresentToday: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'https://localhost:7203/api/Dashboard';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getStats(): Observable<DashboardStats> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { headers });
  }
}
