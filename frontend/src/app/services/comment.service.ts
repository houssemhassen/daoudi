import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly baseUrl = 'http://127.0.0.1:3001/comment';

  constructor(private http: HttpClient) { }

  getArticleComments(articleId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/article/${articleId}`);
  }

  addComment(content: string, articleId: string): Observable<any> {
    return this.http.post(this.baseUrl, { content, articleId });
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${commentId}`);
  }
}
