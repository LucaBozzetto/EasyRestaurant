import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Statistic } from '@models/statistic.model';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';

import { tap, catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  public listStatistics(): Observable<Statistic[]> {
    return this.http.get<Statistic[]>(`${environment.serverUrl}${environment.apiUrl}/statistics`)
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

  public getStatistic(userId: string): Observable<Statistic> {
    return this.http.get<Statistic>(`${environment.serverUrl}${environment.apiUrl}/statistics/${userId}`)
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

}
