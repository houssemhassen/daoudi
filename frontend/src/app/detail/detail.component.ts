import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, Article, Architect } from '../services/data.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  article: Article | null = null;
  architect: Architect | null = null;
  relatedArticles: Article[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data: DataService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadArticle(id);
      }
    });
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/assets/images/default-article.svg';
    }
    
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }    // Check if it's an architect image
    if (this.architect && imagePath === this.architect.image) {
      if (imagePath.includes('uploads/')) {
        return `http://127.0.0.1:3001/uploads/${imagePath}`;
      }
      return `assets/assets/images/architect/${imagePath}`;
    }

    // Check if the image is from uploads folder (for article images)
    if (imagePath.includes('uploads/')) {
      return `http://127.0.0.1:3001/uploads/${imagePath}`;
    }

    // Handle images from specific asset folders
    if (imagePath.startsWith('blog/')) {
      return `assets/assets/images/${imagePath}`;
    }

    // Default to blog images in assets folder
    return `assets/assets/images/blog/${imagePath}`;
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      const isProfile = img.classList.contains('author-image');
      img.src = isProfile ? 
        'assets/assets/images/default-profile.svg' : 
        'assets/assets/images/default-article.svg';
    }
  }

  loadArticle(id: string) {
    this.isLoading = true;
    this.error = null;

    this.data.getById(id).subscribe({
      next: (article) => {
        this.article = article;
        if (article.idArchitect) {
          this.loadArchitect(article.idArchitect);
        }
        if (article.tags) {
          this.loadRelatedArticles(article.tags);
        }
      },
      error: (err) => {
        console.error('Error loading article:', err);
        this.error = 'Failed to load article';
        this.isLoading = false;
      }
    });
  }

  loadArchitect(id: string) {
    this.data.getArchitectById(id).subscribe({
      next: (architect) => {
        this.architect = architect;
      },
      error: (err) => {
        console.error('Error loading architect:', err);
      }
    });
  }

  loadRelatedArticles(tags: string[]) {
    if (tags && tags.length > 0) {
      this.data.searchArticles(tags[0]).subscribe({
        next: (articles) => {
          this.relatedArticles = articles
            .filter(a => a._id !== this.article?._id)
            .slice(0, 3);
        },
        error: (err) => {
          console.error('Error loading related articles:', err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }
}
