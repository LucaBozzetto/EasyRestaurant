import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TokenService } from '@services/token/token.service';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '@services/socket/socket.service';
import { Observable, throwError } from 'rxjs';
import { NotificationER } from '@models/notification.model';
import { environment } from '@env/environment';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient, private tokenService: TokenService,
              private toastr: ToastrService) { }

  public getNotification(notificationId: string): Observable<NotificationER> {
    return this.http.get<NotificationER>(`${environment.serverUrl}${environment.apiUrl}/notifications/${notificationId}`)
    .pipe(
      tap( (res: NotificationER) => {
        const title = res.bar ? 'Beverage Ready' : 'Food Ready';
        this.toastr.info(`The order #${res.orderNumber} for table ${res.tableNumber} is ready.`, title);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred.
          this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          // console.error('An error occurred:', error.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          if (error.status === 500) {
            this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
          } else {
            this.toastr.error(`${error.error.message}`, 'Error');
          }

          // console.log(error.error);
        }

        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
      })
    );
  }

  public getAllNotifications(): Observable<NotificationER[]> {
    return this.http.get<NotificationER[]>(`${environment.serverUrl}${environment.apiUrl}/notifications`)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred.
          this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          // console.error('An error occurred:', error.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          if (error.status === 500) {
            this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
          } else {
            this.toastr.error(`${error.error.message}`, 'Error');
          }

          // console.log(error.error);
        }

        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
      })
    );
  }

  public readNotification(notificationId): Observable<NotificationER> {
    return this.http.delete<NotificationER>(`${environment.serverUrl}${environment.apiUrl}/notifications/${notificationId}`)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred.
          this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          // console.error('An error occurred:', error.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          if (error.status === 500) {
            this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
          } else {
            this.toastr.error(`${error.error.message}`, 'Error');
          }

          // console.log(error.error);
        }

        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
      })
    );
  }

}
