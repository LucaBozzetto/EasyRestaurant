import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Error404Component } from './components/error404/error404.component';
import { HomeComponent } from './components/home/home.component';
import { SignedoutGuardService } from './services/guards/signedout-guard/signedout-guard.service';
import { environment } from '@env/environment';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [SignedoutGuardService],
    loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule),
  },
  // This is used to redirect wrong requests to a 404 error page
  {
    path: '404',
    component: Error404Component,
  },
  {
    path: '**',
    redirectTo: '404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: environment.useHash})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
