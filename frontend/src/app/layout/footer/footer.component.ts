import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  isFooterVisible = true;
  lastScrollPosition = 0;
  scrollThreshold = 50;
  scrollTimeout: any;
  currentYear: number = new Date().getFullYear();

  constructor(
    private router: Router,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
  }
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    const currentScrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Check if we're on a page that should always show the footer
    const path = window.location.pathname;
    const alwaysShowFooterPages = ['/login', '/register', '/about', '/privacy'];
    if (alwaysShowFooterPages.includes(path)) {
      this.isFooterVisible = true;
      return;
    }
    
    // Always show footer when near bottom of page
    if (currentScrollPosition + windowHeight >= documentHeight - 200) {
      this.isFooterVisible = true;
    }
    // Show footer when at top of page
    else if (currentScrollPosition < 50) {
      this.isFooterVisible = true;
    }
    // Show footer when scrolling up significantly
    else if (currentScrollPosition < this.lastScrollPosition - 50) {
      this.isFooterVisible = true;
    }
    // Hide footer when scrolling down past threshold
    else if (currentScrollPosition > this.lastScrollPosition + 50 && currentScrollPosition > this.scrollThreshold) {
      this.isFooterVisible = false;
    }
    
    this.lastScrollPosition = currentScrollPosition;

    // Show footer after user stops scrolling
    this.scrollTimeout = setTimeout(() => {
      this.isFooterVisible = true;
    }, 2000);
  }

  onJoinToday(): void {
    this.router.navigate(['/register']);
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
