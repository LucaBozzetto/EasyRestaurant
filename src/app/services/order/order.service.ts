import { Injectable } from '@angular/core';
import { TokenService } from '@services/token/token.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Order, OrderStatus } from '@models/order.model';
import { ElementER, ElementERStatus } from '@models/element.model';
import { SocketService } from '@services/socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private temporaryOrders: any;

  constructor(private http: HttpClient, private tokenService: TokenService,
              private toastr: ToastrService, private socket: SocketService) {

      this.temporaryOrders = {};
      this.socket.onTableStatusChanged().subscribe( (tableId: string) => this.deleteTemporaryOrder(tableId));
  }

  public addTemporaryElement(tableId: string, element: any) {
    if (!this.temporaryOrders[tableId]) {
      this.temporaryOrders[tableId] = [];
    }
    element.index = this.temporaryOrders[tableId].length;
    this.temporaryOrders[tableId].push(element);
  }

  public updateElementQuantity(tableId: string, index: number, increase: boolean) {
    if (this.temporaryOrders[tableId]) {

      if (increase) {
        this.temporaryOrders[tableId][index].quantity++;
      } else if (this.temporaryOrders[tableId][index].quantity > 0) {
        if ( --this.temporaryOrders[tableId][index].quantity === 0) {
          this.deleteTemporaryElement(tableId, index);
        }
      }

    }
  }

  public updateTemporaryElement(tableId: string, index: number, element: any) {
    if (this.temporaryOrders[tableId]) {
      this.temporaryOrders[tableId][index] = element;
    }
  }

  public getTemporaryOrder(tableId: string): any[] {
    if (this.temporaryOrders[tableId]) {
      return this.temporaryOrders[tableId];
    } else {
      return [];
    }
  }

  public deleteTemporaryElement(tableId: string, index: number) {
    if (this.temporaryOrders[tableId]) {
      this. temporaryOrders[tableId] = this.temporaryOrders[tableId].filter( (elem => {
        if (elem.index === index) {
          return false;
        } else {
          return true;
        }
      }));
    }
    return this.temporaryOrders[tableId];
  }

  public deleteTemporaryOrder(tableId: string) {
    if (this.temporaryOrders[tableId]) {
      this.temporaryOrders[tableId] = [];
    }
  }

  public getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${environment.serverUrl}${environment.apiUrl}/orders/${orderId}`)
      .pipe(
        // tap( (res: Table) => {
        //   this.toastr.success('Table occupied!', 'Occupied');
        // }),
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

  public listOrders(options?: {status?: OrderStatus, date?: Date}): Observable<Order[]> {
    let query = '';
    if (options) {
      const status = options.status;
      const date = options.date;
      query = Object.values(OrderStatus).includes(status) ? `?status=${status}` : '';

      let querySymbol = '?';
      if (query.length > 0) {
        querySymbol = '&';
      }

      query += date ? `${querySymbol}date=${date.toISOString()}` : '';
    }

    // tslint:disable-next-line: max-line-length
    return this.http.get<Order[]>(`${environment.serverUrl}${environment.apiUrl}/orders${query}`)
      .pipe(
        // tap( (res: Table) => {
        //   this.toastr.success('Table occupied!', 'Occupied');
        // }),
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

  public placeOrder(tableId: string, order: any): Observable<Order> {
    return this.http.post<Order>(`${environment.serverUrl}${environment.apiUrl}/tables/${tableId}/orders`, order)
      .pipe(
        tap( (res: Order) => {
          this.toastr.success(`Order #${res.orderNumber} has been placed!`, 'Order submitted');
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

  public updateElement(orderId: string, elementId: string, status: ElementERStatus): Observable<Order> {
    return this.http.put<Order>(`${environment.serverUrl}${environment.apiUrl}/orders/${orderId}/elements/${elementId}`, {status})
      .pipe(
        tap( (res: Order) => {
          // this.toastr.success(`Order #${res.orderNumber} has been placed!`, 'Order submitted');
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

  public beverageReady(orderId: string): Observable<Order> {
    return this.http.put<Order>(`${environment.serverUrl}${environment.apiUrl}/orders/${orderId}`, {beverageCompleted: true})
      .pipe(
        tap( (res: Order) => {
          // this.toastr.success(`Order #${res.orderNumber} has been placed!`, 'Order submitted');
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
}
