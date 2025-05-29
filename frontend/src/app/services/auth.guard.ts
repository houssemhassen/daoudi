import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private _auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('🔒 AuthGuard checking access for route:', state.url);
    
    // Check if user is logged in
    if (!this._auth.isLoggedIn()) {
      console.log('❌ User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    // For create article route, specifically check if user is an architect
    if (state.url.includes('/create')) {
      if (!this._auth.isArchitect()) {
        console.log('❌ User is not an architect, cannot access create article');
        // Show alert and redirect to home
        alert('Only architects can create articles. Please register as an architect to access this feature.');
        this.router.navigate(['/home']);
        return false;
      }
      console.log('✅ Architect verified, allowing access to create article');
    }

    console.log('✅ Access granted');
    return true;
  }
}