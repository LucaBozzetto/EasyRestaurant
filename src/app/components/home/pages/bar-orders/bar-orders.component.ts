import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Order, OrderStatus } from '@models/order.model';
import { OrderService } from '@services/order/order.service';
import { SocketService } from '@services/socket/socket.service';
import { concatMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-bar-orders',
  templateUrl: './bar-orders.component.html',
  styleUrls: ['./bar-orders.component.scss']
})
export class BarOrdersComponent implements OnInit, OnDestroy, AfterViewInit {

  private subscriptions: Subscription[];
  public orders: Order[];

  public searchOrder: string;
  public completedOrderSearch: string;

  constructor(private orderService: OrderService, private socket: SocketService) {
    this.subscriptions = [];
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.subscriptions.push(this.orderService.listOrders().subscribe( (ordersList) => {
      this.orders = ordersList;
      this.orders.sort(this.orderDates);
    }));

    this.subscriptions.push(this.socket.onOrderAdded().pipe(
      concatMap( (res: any) => {
        return this.orderService.getOrder(res.id);
      })
    ).subscribe((order: Order) => {
      this.orders.push(order);
      this.orders.sort(this.orderDates);
    }));

    this.subscriptions.push(this.socket.onOrderStatusChanged().pipe(
      tap( (res: any) => {
        if (res.status === OrderStatus.BeverageReady || OrderStatus.Completed) {
          const index = this.orders.findIndex( (order) => {
            return order._id === res.id;
          });

          this.orders[index].status = res.status;
        }
      })
    ).subscribe());

    // If a table has changed status all of its orders are useless
    this.subscriptions.push(this.socket.onTableStatusChanged().subscribe( (tableId) => {
      this.orders = this.orders.filter( (order) => order.table !== tableId);
      this.orders.sort(this.orderDates);
    }));

    this.subscriptions.push(this.socket.onOrderDeleted().subscribe((res: any) => {
      this.orders = this.orders.filter( (order) => order._id !== res.id);
      this.orders.sort(this.orderDates);
    }));

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  private orderDates(a, b): number {
    if (a.submittedAt > b.submittedAt) {
      return 1;
    }
    if (a.submittedAt < b.submittedAt) {
      return -1;
    }
    return 0;
  }

  public getPendingOrders(): Order[] {
    if (!this.orders) {
      return [];
    }

    return this.orders.filter((order) => {
      return (order.status !== OrderStatus.Completed && order.status !== OrderStatus.BeverageReady
        && order.beverage && order.beverage.length > 0);
    });
  }

  public getCompletedOrders(): Order[] {
    if (!this.orders) {
      return [];
    }

    return this.orders.filter((order) => {
      return ( (order.status === OrderStatus.Completed || order.status === OrderStatus.BeverageReady)
        && order.beverage && order.beverage.length > 0);
    });
  }

  public orderReady(order: Order) {
    this.subscriptions.push(this.orderService.beverageReady(order._id).subscribe());
  }

}
