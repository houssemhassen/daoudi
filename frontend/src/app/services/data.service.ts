import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Architect {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  about: string;
  image: string;
}

export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  date: string;
  idArchitect: string;
  tags: string[];
  architectName?: string; // optional property for displaying architect name
}

export interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    name: string;
  };
  articleId: string;
  createdAt: string;
}

export interface CommentCreate {
  content: string;
  articleId: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private articleUrl = 'http://127.0.0.1:3001/article/';
  private architectUrl = 'http://127.0.0.1:3001/architect/';
  private commentUrl = 'http://127.0.0.1:3001/comment/';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Backend error
      if (error.status === 404) {
        errorMessage = 'Resource not found';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request';
      } else {
        errorMessage = `Server error: ${error.error?.message || error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  create(article: Partial<Article>): Observable<Article> {
    return this.http.post<Article>(this.articleUrl + 'ajout', article)
      .pipe(
        catchError(this.handleError)
      );
  }

  createWithFormData(formData: FormData, headers?: any): Observable<Article> {
  const httpOptions = headers ? { headers } : {};
  return this.http.post<Article>(this.articleUrl + 'ajout', formData, httpOptions)
    .pipe(
      catchError(this.handleError)
    );
}

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.articleUrl + 'all')
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getById(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.articleUrl}getbyid/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getArticleByIdArchitect(id: string): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.articleUrl}getbyidarchitect/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getArchitectById(id: string): Observable<Architect> {
    return this.http.get<Architect>(`${this.architectUrl}getbyid/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  searchArticles(query: string): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.articleUrl}search?query=${query}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllArchitects(): Observable<Architect[]> {
    return this.http.get<Architect[]>(`${this.architectUrl}all`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Comment related methods
  getCommentsByArticle(articleId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.commentUrl}article/${articleId}`)
      .pipe(catchError(this.handleError));
  }

  addComment(comment: CommentCreate): Observable<Comment> {
    return this.http.post<Comment>(`${this.commentUrl}create`, comment)
      .pipe(catchError(this.handleError));
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.commentUrl}${commentId}`)
      .pipe(catchError(this.handleError));
  }
}
