import { Component, OnInit } from '@angular/core';
import { DataService, Article } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  articles: Article[] = [];
  searchQuery: string = '';
  private allArticles: Article[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private data: DataService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tag']) {
        this.searchQuery = params['tag'];
        this.onSearch();
      } else {
        this.loadArticles();
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/assets/images/default-article.svg';
    
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }    // Check if the image is from uploads folder
    if (imagePath.includes('uploads/')) {
      return `http://127.0.0.1:3001/uploads/${imagePath}`;
    }

    // Handle images from assets/blog folder
    if (imagePath.startsWith('blog/')) {
      return `assets/assets/images/${imagePath}`;
    }

    // Default to assets/images/blog folder
    return `assets/assets/images/blog/${imagePath}`;
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/assets/images/default-article.svg';
    }
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;

    this.data.getAll().subscribe({
      next: (articles) => {
        // Load architect details for each article
        articles.forEach(article => {
          this.data.getArchitectById(article.idArchitect).subscribe({
            next: (architect) => {
              article.architectName = architect ? `${architect.name} ${architect.lastname}` : 'Unknown';
            },
            error: () => {
              article.architectName = 'Unknown';
            }
          });
        });
        this.articles = articles;
        this.allArticles = [...articles];
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        this.error = 'Failed to load articles';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    
    if (!query) {
      this.articles = [...this.allArticles];
      return;
    }

    // Do client-side filtering first for immediate response
    this.articles = this.filterArticles(query);

    // Then do server-side search
    this.isLoading = true;
    this.error = null;

    this.data.searchArticles(query).subscribe({
      next: (articles) => {
        // Load architect details for search results
        articles.forEach(article => {
          this.data.getArchitectById(article.idArchitect).subscribe({
            next: (architect) => {
              article.architectName = architect ? `${architect.name} ${architect.lastname}` : 'Unknown';
            },
            error: () => {
              article.architectName = 'Unknown';
            }
          });
        });
        this.articles = articles;
      },
      error: (err) => {
        console.error('Error searching articles:', err);
        this.error = 'Failed to search articles';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.articles = [...this.allArticles];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  filterArticles(query: string): Article[] {
    query = query.toLowerCase();
    return this.allArticles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (article.architectName && article.architectName.toLowerCase().includes(query))
    );
  }

  searchByTag(tag: string): void {
    this.searchQuery = tag;
    this.onSearch();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tag: tag },
      queryParamsHandling: 'merge'
    });
  }
}
