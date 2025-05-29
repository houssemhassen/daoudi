import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
  message?: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isArchitectLogin = false;

  credentials = {
    email: '',
    password: ''
  }

  constructor(private _auth: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  login() {
    if (this.isArchitectLogin) {
      this._auth.loginArchitect(this.credentials)
        .subscribe(
          (res: LoginResponse) => {
            this.handleLoginSuccess(res);
          },
          (err: any) => {
            console.log(err);
          }
        );
    } else {
      this._auth.loginUser(this.credentials)
        .subscribe(
          (res: LoginResponse) => {
            this.handleLoginSuccess(res);
          },
          (err: any) => {
            console.log(err);
          }
        );
    }
  }

  private handleLoginSuccess(res: LoginResponse) {
    if (res.token) {
      this.router.navigate(['/home']);
    }
  }

  toggleLoginType() {
    this.isArchitectLogin = !this.isArchitectLogin;
  }
}
