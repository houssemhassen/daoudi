import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  message?: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  lastname?: string;
  about?: string;
  userType: 'user' | 'architect';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = 'http://127.0.0.1:3001/'; // Base URL matching your server.js

  constructor(private http: HttpClient) { }

  // USER REGISTRATION - Corrected endpoint
  registerUser(user: any): Observable<AuthResponse> {
    const endpoint = this.url + 'user/register';
    console.log('🔹 AuthService: Registering USER at:', endpoint);
    console.log('🔹 User data:', user);
    
    return this.http.post<AuthResponse>(endpoint, user)
      .pipe(
        tap((res: AuthResponse) => {
          console.log('✅ User registration response:', res);
          // Don't auto-login after registration
        })
      );
  }

  // USER LOGIN - Corrected endpoint
  loginUser(user: any): Observable<AuthResponse> {
    const endpoint = this.url + 'user/login';
    console.log('🔹 AuthService: User login at:', endpoint);
    
    return this.http.post<AuthResponse>(endpoint, user)
      .pipe(
        tap((res: AuthResponse) => {
          console.log('✅ User login response:', res);
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('userType', 'user');
          }
        })
      );
  }

  // ARCHITECT REGISTRATION - Corrected endpoint  
  register(formData: FormData): Observable<AuthResponse> {
    const endpoint = this.url + 'architect/register';
    console.log('🔹 AuthService: Registering ARCHITECT at:', endpoint);
    
    // Log FormData contents for debugging
    console.log('🔹 FormData contents:');
    formData.forEach((value, key) => {
      console.log(`  ${key}:`, value);
    });
    
    return this.http.post<AuthResponse>(endpoint, formData)
      .pipe(
        tap((res: AuthResponse) => {
          console.log('✅ Architect registration response:', res);
          // Don't auto-login after registration
        })
      );
  }

  // ARCHITECT LOGIN - Corrected endpoint
  loginArchitect(architect: any): Observable<AuthResponse> {
    const endpoint = this.url + 'architect/login';
    console.log('🔹 AuthService: Architect login at:', endpoint);
    
    return this.http.post<AuthResponse>(endpoint, architect)
      .pipe(
        tap((res: AuthResponse) => {
          console.log('✅ Architect login response:', res);
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('userType', 'architect');
          }
        })
      );
  }

  // AUTH STATUS CHECKS
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && this.isTokenValid(token);
  }

  isArchitect(): boolean {
    const userType = this.getUserType();
    console.log('🔍 Checking if architect - userType:', userType);
    return userType === 'architect';
  }

  isUser(): boolean {
    const userType = this.getUserType();
    console.log('🔍 Checking if user - userType:', userType);
    return userType === 'user';
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isValid = payload.exp > Date.now() / 1000;
      console.log('🔍 Token valid:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  }

  // TOKEN MANAGEMENT
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserType(): 'user' | 'architect' | null {
    const userType = localStorage.getItem('userType') as 'user' | 'architect' | null;
    console.log('🔍 Retrieved userType from localStorage:', userType);
    return userType;
  }

  logout(): void {
    console.log('🚪 Logging out - clearing localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
  }

  // GET USER DATA FROM TOKEN
  getArchitectDataFromToken(): UserData | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData: UserData = {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          lastname: payload.lastname,
          about: payload.about,
          userType: this.getUserType() || 'user'
        };
        console.log('🔍 User data from token:', userData);
        return userData;
      } catch (error) {
        console.error('❌ Error parsing token:', error);
        return null;
      }
    }
    return null;
  }

  getUserDataFromToken(): UserData | null {
    return this.getArchitectDataFromToken();
  }

  // DEBUG METHOD
  debugAuthState(): void {
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Base URL:', this.url);
    console.log('Token:', this.getToken()?.substring(0, 20) + '...');
    console.log('User Type:', this.getUserType());
    console.log('Is Logged In:', this.isLoggedIn());
    console.log('Is Architect:', this.isArchitect());
    console.log('Is User:', this.isUser());
    console.log('User Data:', this.getUserDataFromToken());
    console.log('=======================');
  }
}