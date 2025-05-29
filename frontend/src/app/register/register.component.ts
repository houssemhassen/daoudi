import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  isArchitectRegistration = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  passwordStrength = 0;
  debugInfo: any = {};
  
  formData = {
    name: '',
    lastname: '',
    email: '',
    password: '',
    about: ''
  }

  image: any;

  touchedFields = {
    name: false,
    lastname: false,
    email: false,
    password: false
  };

  constructor(
    private _auth: AuthService, 
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.testBackendConnection();
  }

  // Test if backend is reachable
  async testBackendConnection(): Promise<void> {
    console.log('🔍 Testing backend connection...');
    
    try {
      // Test basic backend connection
      const response = await this.http.get('http://127.0.0.1:3001/').toPromise();
      console.log('✅ Backend is reachable:', response);
      this.debugInfo.backendReachable = true;
    } catch (error) {
      console.error('❌ Backend not reachable:', error);
      this.debugInfo.backendReachable = false;
      this.errorMessage = 'Backend server is not running on port 3001';
    }

    // Test specific endpoints
    await this.testEndpoints();
  }

  async testEndpoints(): Promise<void> {
    const endpoints = [
      'http://127.0.0.1:3001/user/register',      // Correct endpoint from server.js
      'http://127.0.0.1:3001/architect/register', // Correct endpoint from server.js
      'http://127.0.0.1:3001/api/users/register', // Wrong endpoint (for comparison)
      'http://127.0.0.1:3001/api/architects/register' // Wrong endpoint (for comparison)
    ];

    this.debugInfo.endpointTests = {};

    for (const endpoint of endpoints) {
      try {
        // Make an OPTIONS request to test if endpoint exists
        await this.http.options(endpoint).toPromise();
        console.log(`✅ Endpoint exists: ${endpoint}`);
        this.debugInfo.endpointTests[endpoint] = 'exists';
      } catch (error: any) {
        if (error.status === 404) {
          console.log(`❌ Endpoint not found: ${endpoint}`);
          this.debugInfo.endpointTests[endpoint] = 'not_found';
        } else if (error.status === 0) {
          console.log(`⚠️ CORS or network issue: ${endpoint}`);
          this.debugInfo.endpointTests[endpoint] = 'cors_issue';
        } else {
          console.log(`🔶 Endpoint exists but has issues: ${endpoint}`, error.status);
          this.debugInfo.endpointTests[endpoint] = `status_${error.status}`;
        }
      }
    }
  }

  select(e: any) {
    this.image = e.target.files[0];
    console.log('📁 Image selected:', this.image?.name, 'Size:', this.image?.size, 'bytes');
  }

  async register() {
    console.log('🚀 Registration attempt started');
    console.log('📋 Registration type:', this.isArchitectRegistration ? 'ARCHITECT' : 'USER');
    console.log('📄 Form data:', this.formData);
    console.log('🖼️ Image file:', this.image?.name || 'No image');

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      if (this.isArchitectRegistration) {
        await this.registerArchitect();
      } else {
        await this.registerUser();
      }
    } catch (error) {
      console.error('💥 Registration failed completely:', error);
      this.errorMessage = 'Registration failed: ' + (error || 'Unknown error');
      this.isLoading = false;
    }
  }

  private async registerArchitect(): Promise<void> {
    console.log('✅ Taking ARCHITECT registration path');
    
    // Validate required fields
    if (!this.formData.name || !this.formData.lastname || !this.formData.email || !this.formData.password) {
      throw new Error('Please fill in all required fields');
    }

    const fd = new FormData();
    fd.append('name', this.formData.name);
    fd.append('lastname', this.formData.lastname);
    fd.append('email', this.formData.email);
    fd.append('password', this.formData.password);
    fd.append('about', this.formData.about);
    
    if (this.image) {
      fd.append('image', this.image);
    }

    // Debug FormData
    console.log('📦 FormData being sent:');
    fd.forEach((value, key) => {
      console.log(`  ${key}:`, value);
    });

    try {
      console.log('📡 Making architect registration request...');
      const response = await this._auth.register(fd).toPromise();
      console.log('✅ Architect registration successful:', response);
      
      this.successMessage = 'Architect registration successful! Redirecting to login...';
      this.isLoading = false;
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Architect registration failed:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      let errorMsg = 'Registration failed';
      if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      } else if (error.status === 0) {
        errorMsg = 'Cannot connect to server. Check if backend is running.';
      } else if (error.status === 404) {
        errorMsg = 'Registration endpoint not found. Check backend routes.';
      } else if (error.status >= 500) {
        errorMsg = 'Server error. Check backend logs.';
      }
      
      this.errorMessage = errorMsg;
      this.isLoading = false;
    }
  }

  private async registerUser(): Promise<void> {
    console.log('✅ Taking USER registration path');
    
    // Validate required fields
    if (!this.formData.name || !this.formData.email || !this.formData.password) {
      throw new Error('Please fill in all required fields');
    }

    const userData = {
      name: this.formData.name,
      email: this.formData.email,
      password: this.formData.password
    };

    console.log('👤 User data being sent:', userData);

    try {
      console.log('📡 Making user registration request...');
      const response = await this._auth.registerUser(userData).toPromise();
      console.log('✅ User registration successful:', response);
      
      this.successMessage = 'User registration successful! Redirecting to login...';
      this.isLoading = false;
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ User registration failed:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      let errorMsg = 'Registration failed';
      if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.message) {
        errorMsg = error.message;
      } else if (error.status === 0) {
        errorMsg = 'Cannot connect to server. Check if backend is running.';
      } else if (error.status === 404) {
        errorMsg = 'Registration endpoint not found. Check backend routes.';
      } else if (error.status >= 500) {
        errorMsg = 'Server error. Check backend logs.';
      }
      
      this.errorMessage = errorMsg;
      this.isLoading = false;
    }
  }

  toggleRegistrationType() {
    this.isArchitectRegistration = !this.isArchitectRegistration;
    console.log('🔄 Registration type toggled to:', this.isArchitectRegistration ? 'ARCHITECT' : 'USER');
    
    // Clear form data when switching types
    if (!this.isArchitectRegistration) {
      this.formData.lastname = '';
      this.formData.about = '';
      this.image = null;
    }
    
    // Clear messages
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  checkPasswordStrength() {
    const password = this.formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    this.passwordStrength = strength;
  }

  getPasswordFeedback(): { message: string; class: string } {
    switch (this.passwordStrength) {
      case 0:
      case 1:
        return { message: 'Very weak', class: 'text-danger' };
      case 2:
        return { message: 'Weak', class: 'text-warning' };
      case 3:
        return { message: 'Medium', class: 'text-info' };
      case 4:
        return { message: 'Strong', class: 'text-primary' };
      case 5:
        return { message: 'Very strong', class: 'text-success' };
      default:
        return { message: '', class: '' };
    }
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.formData.password);
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.formData.password);
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.formData.password);
  }

  hasSpecialChar(): boolean {
    return /[^A-Za-z0-9]/.test(this.formData.password);
  }

  hasMinLength(): boolean {
    return this.formData.password.length >= 8;
  }

  markAsTouched(field: keyof typeof this.touchedFields) {
    this.touchedFields[field] = true;
  }

  isValidEmail(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.formData.email);
  }

  getFieldState(field: string): 'valid' | 'invalid' | 'untouched' {
    if (!this.touchedFields[field as keyof typeof this.touchedFields]) {
      return 'untouched';
    }
    switch (field) {
      case 'email':
        return this.formData.email && this.isValidEmail() ? 'valid' : 'invalid';
      case 'password':
        return this.formData.password && this.passwordStrength >= 3 ? 'valid' : 'invalid';
      default:
        return this.formData[field as keyof typeof this.formData] ? 'valid' : 'invalid';
    }
  }

  // Debug helper
  showDebugInfo() {
    console.log('=== FULL DEBUG INFO ===');
    console.log('Backend reachable:', this.debugInfo.backendReachable);
    console.log('Endpoint tests:', this.debugInfo.endpointTests);
    console.log('Form data:', this.formData);
    console.log('Registration type:', this.isArchitectRegistration);
    console.log('========================');
  }
}