import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './detail/detail.component';
import { CreatearticleComponent } from './createarticle/createarticle.component';
import { AboutComponent } from './about/about.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ArchitectComponent } from './architect/architect.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ProfileComponent } from './profiles/profile.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: '/home', pathMatch:'full' },
  {path: 'home' , component: HomeComponent },
  {path: 'article/:id' , component:DetailComponent},
  {path: 'create' , canActivate: [ AuthGuard ] ,component:CreatearticleComponent},
  {path: 'about' , component: AboutComponent},
  {path: 'privacy',component: PrivacyComponent},
  {path: 'architect/:id',component:ArchitectComponent},
  {path: 'profile', canActivate: [ AuthGuard ], component: ProfileComponent},
  {path: 'login',component: LoginComponent},
  {path: 'register',component: RegisterComponent},
  {path: '**',component:NotfoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }