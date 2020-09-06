import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { User, Role } from '@models/user.model';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { TokenService } from '@services/token/token.service';

import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SocketService, SocketEvents } from '@services/socket/socket.service';

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

interface RegisterData {
  username: string;
  password: string;
  name: string;
  surname: string;
  role: Role;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private tokenService: TokenService, private router: Router,
              private toastr: ToastrService, private socket: SocketService) { }

  public login(userData: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.serverUrl}${environment.apiUrl}/login`, userData)
      .pipe(
        tap( (res) => {
          this.tokenService.setToken(res.token);
          const user = this.getUser();
          this.socket.broadcast(SocketEvents.USER_AUTHENTICATED, `{"id": "${user._id}", "role": "${user.role}"}`);
          this.router.navigateByUrl('menu');
          this.toastr.success('Succesfully logged in', 'Login');
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          } else {
            // The backend returned an unsuccessful response code.
            if (error.status === 401) {
              this.toastr.error('Please check your username or password', 'Login failed');
            } else {
              this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
            }
          }

          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        })
      );
  }

  public register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.serverUrl}${environment.apiUrl}/register`, userData)
      .pipe(
        tap( (res) => {
          this.tokenService.setToken(res.token);
          const user = this.getUser();
          this.socket.broadcast(SocketEvents.USER_AUTHENTICATED, `{"id": "${user._id}", "role": "${user.role}"}`);
          this.router.navigateByUrl('menu');
          this.toastr.success('You have succesfully registered', 'Welcome');
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          } else {
            // The backend returned an unsuccessful response code.
            if (error.status === 400) {
              this.toastr.error(`${error.error.message}`, 'Registration failed');
            } else {
              this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
            }
          }

          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        })
      );
  }

  public listUsers(): Observable<any> {
    return this.http.get(`${environment.serverUrl}${environment.apiUrl}/users`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          } else {
            // The backend returned an unsuccessful response code.
            if (error.status === 500) {
              this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
            } else {
              this.toastr.error(`${error.error.message}`, 'Error');
            }
          }

          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        })
      );
  }

  public updateUser(username: string, update?: any): Observable<User> {
    return this.http.put<User>(`${environment.serverUrl}${environment.apiUrl}/users/${username}`, {admin: true})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          } else {
            // The backend returned an unsuccessful response code.
            if (error.status === 500) {
              this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
            } else {
              this.toastr.error(`${error.error.message}`, 'Error');
            }
          }

          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        })
      );
  }

  public deleteUser(username: string): Observable<User> {
    return this.http.delete<User>(`${environment.serverUrl}${environment.apiUrl}/users/${username}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          } else {
            // The backend returned an unsuccessful response code.
            if (error.status === 500) {
              this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
            } else {
              this.toastr.error(`${error.error.message}`, 'Error');
            }
          }

          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        })
      );
  }

  public getUserFromUsername(username: string): Observable<User> {
    return this.http.get<User>(`${environment.serverUrl}${environment.apiUrl}/users/${username}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          } else {
            // The backend returned an unsuccessful response code.
            if (error.status === 500) {
              this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
            } else {
              this.toastr.error(`${error.error.message}`, 'Error');
            }
          }

          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        })
      );
  }

  public logout(): void {
    const token = this.tokenService.getToken();
    const user = this.getUser();
    this.socket.broadcast(SocketEvents.USER_SIGNED_OUT, `{"id": "${user._id}", "role": "${user.role}"}`);
    this.tokenService.removeToken();

    this.router.navigateByUrl('auth');
  }

  public getUser(): User {
    const token = this.tokenService.getToken();

    if (token) {
      return this.tokenService.getUserFromToken(token);
    }

    return null;
  }

}
