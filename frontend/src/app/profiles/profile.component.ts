import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserData } from '../services/auth.service';
import { DataService, Article } from '../services/data.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface UpdateResponse {
  message: string;
  token?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userData: UserData | null = null;
  userArticles: Article[] = [];
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Profile stats
  totalArticles = 0;
  totalViews = 0;
  joinDate: string = '';

  // Edit mode states
  isEditMode = false;
  isUpdatingProfile = false;
  
  // Form data for editing
  editForm = {
    name: '',
    lastname: '',
    email: '',
    about: ''
  };

  // Image upload
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  private apiUrl = 'http://127.0.0.1:3001/';

  constructor(
    private router: Router,
    private http: HttpClient,
    public authService: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfileData();
  }

  private async loadProfileData(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Get user data from token
      this.userData = this.authService.getUserDataFromToken();
      
      if (!this.userData) {
        throw new Error('Unable to load user data');
      }

      // If user is architect, try to load their articles
      if (this.userData.userType === 'architect') {
        try {
          const articles = await firstValueFrom(
            this.dataService.getArticleByIdArchitect(this.userData.id).pipe(
              catchError(err => {
                console.warn('Could not load articles:', err);
                return []; // Return empty array if articles can't be loaded
              })
            )
          );
          this.userArticles = Array.isArray(articles) ? articles : [];
          this.totalArticles = this.userArticles.length;
        } catch (error) {
          console.warn('Articles could not be loaded:', error);
          this.userArticles = [];
        }
      }

      // Calculate join date (if available in token)
      this.calculateJoinDate();

    } catch (err: any) {
      this.handleError(err.message || 'Failed to load profile data');
    } finally {
      this.isLoading = false;
    }
  }

  private calculateJoinDate(): void {
    // Try to get join date from token payload if available
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.iat) {
          this.joinDate = new Date(payload.iat * 1000).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          });
        }
      } catch (error) {
        console.warn('Could not parse token date:', error);
      }
    }
    
    // Fallback if no date available
    if (!this.joinDate) {
      this.joinDate = 'Recently';
    }
  }

  private handleError(message: string): void {
    this.error = message;
    this.isLoading = false;
  }

  // Handle profile image error
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/assets/images/blog/01.jpg'; // Default profile image
    }
  }

  // Handle article image error
  handleArticleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/assets/images/blog/04.jpg'; // Default article image
    }
  }

  // Utility methods
  getReadTime(content: string): string {
    if (!content) return '0 min read';
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min read`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Navigation methods
  navigateToCreateArticle(): void {
    this.router.navigate(['/create']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Edit mode methods
  enterEditMode(): void {
    this.isEditMode = true;
    this.clearMessages();
    
    // Populate edit form with current data
    this.editForm = {
      name: this.userData?.name || '',
      lastname: this.userData?.lastname || '',
      email: this.userData?.email || '',
      about: this.userData?.about || ''
    };
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.clearMessages();
    
    // Reset file input
    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Handle image selection
  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select a valid image file';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Image size should be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.clearMessages();

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Remove selected image
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    
    // Reset file input
    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Validate form
  private validateForm(): boolean {
    if (!this.editForm.name.trim()) {
      this.error = 'Name is required';
      return false;
    }

    if (!this.editForm.email.trim()) {
      this.error = 'Email is required';
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editForm.email)) {
      this.error = 'Please enter a valid email address';
      return false;
    }

    return true;
  }

  // Update profile
  async updateProfile(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isUpdatingProfile = true;
    this.clearMessages();

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('name', this.editForm.name.trim());
      formData.append('lastname', this.editForm.lastname.trim());
      formData.append('email', this.editForm.email.trim());
      formData.append('about', this.editForm.about.trim());

      // Add image if selected
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // Determine endpoint based on user type
      const endpoint = this.userData?.userType === 'architect' ? 
        `${this.apiUrl}architect/update` : 
        `${this.apiUrl}user/update`;

      // Make API request
      const response = await this.http.put<UpdateResponse>(endpoint, formData).toPromise();

      if (response) {
        this.successMessage = response.message || 'Profile updated successfully!';
        
        // Update token if new one is provided
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Exit edit mode and reload data
        this.isEditMode = false;
        this.selectedFile = null;
        this.imagePreview = null;
        await this.loadProfileData();

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      }

    } catch (error: any) {
      console.error('Profile update error:', error);
      this.error = error.error?.message || 'Failed to update profile. Please try again.';
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  // Clear messages
  private clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  // Get current profile image URL
  getCurrentImageUrl(): string {
    if (this.imagePreview) {
      return this.imagePreview;
    }
    
    // Return default image for now - you can implement actual profile image loading
    return 'assets/assets/images/blog/01.jpg';
  }
}