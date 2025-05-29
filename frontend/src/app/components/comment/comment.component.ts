import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DataService, Comment } from '../../services/data.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  @Input() articleId!: string;

  comments: Comment[] = [];
  newComment: string = '';
  error: string | null = null;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.loadComments();
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get currentUserId(): string | null {
    const userData = this.auth.getArchitectDataFromToken();
    return userData?.id || null;
  }

  async loadComments(): Promise<void> {
    this.isLoading = true;
    try {
      const comments = await firstValueFrom(
        this.dataService.getCommentsByArticle(this.articleId)
      );
      this.comments = comments;
    } catch (err) {
      this.error = 'Failed to load comments';
      console.error('Error loading comments:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async addComment(): Promise<void> {
    if (!this.newComment.trim() || !this.isLoggedIn) {
      return;
    }

    this.isLoading = true;
    try {
      const comment = await firstValueFrom(
        this.dataService.addComment({
          content: this.newComment,
          articleId: this.articleId
        })
      );
      
      if (comment) {
        this.comments.unshift(comment);
        this.newComment = '';
      }
    } catch (err) {
      this.error = 'Failed to post comment';
      console.error('Error posting comment:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteComment(commentId: string, index: number): Promise<void> {
    try {
      await firstValueFrom(this.dataService.deleteComment(commentId));
      this.comments.splice(index, 1);
    } catch (err) {
      this.error = 'Failed to delete comment';
      console.error('Error deleting comment:', err);
    }
  }
}
