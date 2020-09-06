import { Injectable } from '@angular/core';
import { TokenService } from '@services/token/token.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Table } from '@models/table.model';
import { environment } from '@env/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Order } from '@models/order.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  constructor(private http: HttpClient, private tokenService: TokenService,
              private toastr: ToastrService) { }

  private compare(a: Table, b: Table): number {
    if (a.tableNumber < b.tableNumber) {
      return -1;
    } else if (a.tableNumber > b.tableNumber) {
      return 1;
    }
    return 0;
  }

  public listAllTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${environment.serverUrl}${environment.apiUrl}/tables`)
      .pipe(
        tap( (res: Table[]) => {
          res.sort(this.compare);
          // this.toastr.success('Succesfully loaded the tables list', 'Tables');
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          } else {
            // The backend returned an unsuccessful response code.
              this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
          }

          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        })
      );
  }

  public getSingleTable(tableId: string): Observable<Table> {
    return this.http.get<Table>(`${environment.serverUrl}${environment.apiUrl}/tables/${tableId}`)
      .pipe(
        // tap( (res: Table) => {
        //   this.toastr.warning('A table has changed status', 'Tables');
        // }),
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            this.toastr.warning(`Check your internet connection and retry \n ${error.error.message}`, 'Unexpected Error!');
          } else {
            // The backend returned an unsuccessful response code.
              this.toastr.error('Our server is not working properly, please try again later', 'Server error!');
          }

          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        })
      );
  }

  public occupyTable(customers: number, id: string): Observable<Table> {
    return this.http.put<Table>(`${environment.serverUrl}${environment.apiUrl}/tables/${id}/occupy`, {customers})
      .pipe(
        // tap( (res: Table) => {
        //   this.toastr.success('Table occupied!', 'Occupied');
        // }),
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

  public ordersList(tableId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.serverUrl}${environment.apiUrl}/tables/${tableId}/orders`)
      .pipe(
        // tap( (res: Table) => {
        //   this.toastr.success('Table occupied!', 'Occupied');
        // }),
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

  public freeTable(tableId: string): Observable<Table> {
    return this.http.delete<Table>(`${environment.serverUrl}${environment.apiUrl}/tables/${tableId}/free`)
      .pipe(
        tap( (res: Table) => {
          this.toastr.success('The bill has been payed and the table is now free!', 'Checkout Completed');
        }),
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

  public addTable(table: {seats: number}): Observable<Table> {
    return this.http.post<Table>(`${environment.serverUrl}${environment.apiUrl}/tables`, table)
      .pipe(
        tap( (res: Table) => {
          this.toastr.success(`The table ${res.tableNumber} has been created`, 'Table added');
        }),
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
