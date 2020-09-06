import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ToastrModule } from 'ngx-toastr';
import { TokenService } from '@services/token/token.service';
import { Error404Component } from '@components/error404/error404.component';
import { HomeModule } from '@components/home/home.module';
import { UserService } from '@services/user/user.service';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from '@services/socket/socket.service';
import { OrderService } from '@services/order/order.service';
import { environment } from '@env/environment';

@NgModule({
  declarations: [
    AppComponent,
    Error404Component,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgProgressModule.withConfig({
      thick: true,
    }),
    NgProgressHttpModule,
    FormsModule,
    CommonModule,
    ToastrModule.forRoot({progressBar: true, positionClass: environment.mobile ? 'toast-bottom-center' : 'toast-top-center'}),
    HomeModule,
    AppRoutingModule,
  ],
  providers: [TokenService, UserService, SocketService, OrderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
