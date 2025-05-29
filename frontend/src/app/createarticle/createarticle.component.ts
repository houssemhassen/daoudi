import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
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

  constructor(
    private _auth: AuthService,
    private data: DataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if user is architect
    if (!this._auth.isArchitect()) {
      this.router.navigate(['/home']);
    }
  }

  select(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.image = input.files[0];
    }
  }

  create(): void {
    const architectData = this._auth.getArchitectDataFromToken();
    if (!architectData?.id || !this.image) {
      console.error('Missing required data');
      return;
    }

    const fd = new FormData();
    fd.append('title', this.article.title);
    fd.append('content', this.article.content);
    fd.append('tags', this.article.tags.toString());
    fd.append('description', this.article.description);
    fd.append('image', this.image);
    fd.append('idArchitect', architectData.id);

    this.data.createWithFormData(fd).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error creating article:', err);
      }
    });
  }
}
