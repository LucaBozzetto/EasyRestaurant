import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { CommonModule } from '@angular/common';
import { ForgotComponent } from './forgot/forgot.component';
import { FormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    CommonModule,
    MatSelectModule,
  ],
  exports: [RouterModule],
  providers: [],
  declarations: [
    AuthComponent,
    LoginComponent,
    RegistrationComponent,
    ForgotComponent
  ]
})
export class AuthModule { }
