import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Item, ItemType } from '@models/item.model';
import { environment } from '@env/environment';
import { catchError, tap } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  public getItemList(): Observable<Item[]> {
    return this.http.get<Item[]>(`${environment.serverUrl}${environment.apiUrl}/items`)
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

  public addItem(item: {name: string, price: number, type: ItemType, tag?: string, timerRequired?: number}): Observable<Item> {
    return this.http.post<Item>(`${environment.serverUrl}${environment.apiUrl}/items`, item)
      .pipe(
        tap( (res: Item) => {
          this.toastr.success(`The new item has been created`, 'Item added');
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
