import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isNavbarVisible = true;
  lastScrollPosition = 0;
  scrollThreshold = 50;
  showAccountDropdown = false;

  constructor(public _auth: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const currentScrollPosition = window.pageYOffset;
    const header = document.querySelector('.header-nav') as HTMLElement;
    
    // Add or remove at-top class
    if (currentScrollPosition <= 0) {
      header?.classList.add('at-top');
    } else {
      header?.classList.remove('at-top');
    }
    
    // Show navbar when scrolling up or at the top
    if (currentScrollPosition < this.lastScrollPosition || currentScrollPosition < this.scrollThreshold) {
      this.isNavbarVisible = true;
    } 
    // Hide navbar when scrolling down past threshold
    else if (currentScrollPosition > this.lastScrollPosition && currentScrollPosition > this.scrollThreshold) {
      this.isNavbarVisible = false;
    }
    
    this.lastScrollPosition = currentScrollPosition;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-dropdown-container')) {
      this.showAccountDropdown = false;
    }
  }

  toggleAccountDropdown(event: Event) {
    event.preventDefault();
    this.showAccountDropdown = !this.showAccountDropdown;
  }

  logout() {
    this._auth.logout();
    this.showAccountDropdown = false;
    this.router.navigate(['/login']);
  }

  getUserData() {
    return this._auth.getUserDataFromToken();
  }
}