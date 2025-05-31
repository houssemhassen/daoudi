import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

interface ArticleForm {
  title: string;
  content: string;
  tags: string[];
  description: string;
}

@Component({
  selector: 'app-createarticle',
  templateUrl: './createarticle.component.html',
  styleUrls: ['./createarticle.component.css']
})
export class CreatearticleComponent implements OnInit {
  article: ArticleForm = {
    title: '',
    content: '',
    tags: [],
    description: ''
  };
  
  tag: string = '';
  image: File | null = null;
  isCreating: boolean = false;
  error: string | null = null;

  constructor(
    private _auth: AuthService,
    private data: DataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this._auth.isArchitect()) {
      this.router.navigate(['/home']);
    }
  }

  select(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select a valid image file';
        this.image = null;
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Image size should be less than 5MB';
        this.image = null;
        return;
      }
      
      this.image = file;
      this.error = null;
      console.log('✅ Image selected:', file.name);
    }
  }

  addTag(): void {
    if (this.tag.trim() && !this.article.tags.includes(this.tag.trim())) {
      this.article.tags.push(this.tag.trim());
      this.tag = '';
    }
  }

  removeTag(index: number): void {
    this.article.tags.splice(index, 1);
  }

  validateForm(): boolean {
    this.error = null;
    
    if (!this.article.title.trim()) {
      this.error = 'Title is required';
      return false;
    }
    
    if (!this.article.description.trim()) {
      this.error = 'Description is required';
      return false;
    }
    
    if (!this.article.content.trim()) {
      this.error = 'Content is required';
      return false;
    }
    
    if (!this.image) {
      this.error = 'Please select an image';
      return false;
    }
    
    return true;
  }

  create(): void {
    if (!this.validateForm()) {
      return;
    }

    const architectData = this._auth.getArchitectDataFromToken();
    if (!architectData?.id) {
      this.error = 'Unable to get user information';
      return;
    }

    this.isCreating = true;
    this.error = null;

    const fd = new FormData();
    fd.append('title', this.article.title.trim());
    fd.append('content', this.article.content.trim());
    fd.append('tags', this.article.tags.join(','));
    fd.append('description', this.article.description.trim());
    fd.append('image', this.image!);
    fd.append('idArchitect', architectData.id);

    // Get auth token
    const token = this._auth.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    this.data.createWithFormData(fd, headers).subscribe({
      next: (response) => {
        console.log('✅ Article created successfully:', response);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('❌ Error creating article:', err);
        this.error = err.error?.message || 'Failed to create article. Please try again.';
        this.isCreating = false;
      },
      complete: () => {
        this.isCreating = false;
      }
    });
  }
}