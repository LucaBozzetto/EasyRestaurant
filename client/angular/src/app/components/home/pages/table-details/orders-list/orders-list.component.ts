import { Component, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Subscription, concat } from 'rxjs';
import { Order, OrderStatus } from '@models/order.model';
import { TableService } from '@services/table/table.service';
import { SocketService } from '@services/socket/socket.service';
import { concatMap } from 'rxjs/operators';
import { OrderService } from '@services/order/order.service';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() tableId: string;

  private subscriptions: Subscription[];
  public orders: any[];

  constructor(private tableService: TableService, private socket: SocketService, private orderService: OrderService) {
    this.subscriptions = [];
    this.orders = [];
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.subscriptions.push(this.tableService.ordersList(this.tableId).subscribe((ordersList) => {
      this.orders = ordersList;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < ordersList.length; i++) {
        this.orders[i].tabOpened = false;
      }
    }));
    this.subscriptions.push(this.socket.onOrderStatusCompleted().pipe(
      concatMap( (orderId: string) => {
        return this.orderService.getOrder(orderId);
      })
    ).subscribe( (order) => {
      const index = this.orders.findIndex(elem => elem._id === order._id);
      if (index > -1) {
        this.orders[index] = order;
      } else {
        console.log('error');
      }
    }));
    this.subscriptions.push(this.socket.onOrderAdded().pipe(
      concatMap( (res: any) => {
        return this.orderService.getOrder(res.id);
      })
    ).subscribe((order: any) => {
      order.tabOpened = false;
      this.orders.push(order);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  public toggleTab(orderId) {
    const index = this.orders.findIndex( (order) => {
      return order._id === orderId;
    });

    if (index > -1) {
      this.orders[index].tabOpened = !this.orders[index].tabOpened;
    }
  }

  public getOrderStatus(status: OrderStatus) {
    if (status === OrderStatus.Completed ) {
      return 'Completed';
    } else {
      return 'Preparation';
    }
  }
}
