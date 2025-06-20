import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ArchitectComponent } from './architect/architect.component';
import { CreatearticleComponent } from './createarticle/createarticle.component';
import { DetailComponent } from './detail/detail.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ProfileComponent } from './profiles/profile.component';
import { CoverComponent } from './home/cover/cover.component';
import { BlogListComponent } from './home/blog-list/blog-list.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CommentComponent } from './components/comment/comment.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    AboutComponent,
    ArchitectComponent,
    CreatearticleComponent,
    DetailComponent,
    LoginComponent,
    RegisterComponent,
    NotfoundComponent,
    PrivacyComponent,
    ProfileComponent,
    CoverComponent,
    BlogListComponent,
    CommentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    AngularEditorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }