import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService, Architect, Article } from '../services/data.service';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-architect',
  templateUrl: './architect.component.html',
  styleUrls: ['./architect.component.css']
})
export class ArchitectComponent implements OnInit {
  id: string | null = null;
  architect: Architect | null = null;
  articles: Article[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private act: ActivatedRoute,
    private router: Router,
    public _auth: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    const id = this.act.snapshot.paramMap.get('id');
    if (id) {
      this.id = id;
      this.loadData();
    } else {
      this.handleError('Architect ID not found');
    }
  }

  getImageUrl(imagePath: string, type: 'profile' | 'article'): string {
    if (!imagePath) {
      return type === 'profile' ? 
        'assets/assets/images/blog/05.jpg' : 
        'assets/assets/images/blog/06.jpg';
    }
    
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }    // Check if the image is from uploads folder
    if (imagePath.includes('uploads/')) {
      return `http://127.0.0.1:3001/uploads/${imagePath}`;
    }

    // Handle images from specific asset folders
    if (imagePath.startsWith('blog/') || imagePath.startsWith('architect/')) {
      return `assets/assets/images/${imagePath}`;
    }

    // Return appropriate asset based on type
    if (type === 'profile') {
      return `assets/assets/images/architect/${imagePath}`;
    }
    return `assets/assets/images/blog/${imagePath}`;
  }

  handleImageError(event: Event, type: 'profile' | 'article'): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = type === 'profile' ? 
        'assets/assets/images/blog/01.jpg' : 
        'assets/assets/images/blog/04.jpg';
    }
  }

  private async loadData(): Promise<void> {
    if (!this.id) return;
    
    this.isLoading = true;
    this.error = null;
    
    try {
      // Using Promise.all to load data in parallel
      const [architect, articles] = await Promise.all([
        firstValueFrom(this.dataService.getArchitectById(this.id).pipe(
          catchError(err => {
            throw new Error('Failed to load architect data: ' + (err.error?.message || err.message));
          })
        )),
        firstValueFrom(this.dataService.getArticleByIdArchitect(this.id).pipe(
          catchError(err => {
            throw new Error('Failed to load articles: ' + (err.error?.message || err.message));
          })
        ))
      ]);
      
      this.architect = architect;
      this.articles = articles;

      if (!this.architect) {
        throw new Error('Architect not found');
      }
    } catch (err: any) {
      this.handleError(err.message || 'An unexpected error occurred');
    } finally {
      this.isLoading = false;
    }
  }

  private handleError(message: string): void {
    this.error = message;
    this.isLoading = false;
    if (!this.architect) {
      // Redirect to home after 3 seconds if architect not found
      setTimeout(() => this.router.navigate(['/home']), 3000);
    }
  }

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
}
