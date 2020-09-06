import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from '@services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { Order, OrderStatus } from '@models/order.model';
import { ElementER, ElementERStatus } from '@models/element.model';
import { OrderService } from '@services/order/order.service';
import { concatMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-cook-order-details',
  templateUrl: './cook-order-details.component.html',
  styleUrls: ['./cook-order-details.component.scss']
})
export class CookOrderDetailsComponent implements OnInit, OnDestroy, AfterViewInit {

  public orderId: string;
  private subscriptions: Subscription[];
  public order: Order;
  public tabs = {
    waiting: true,
    preparation: true,
    completed: true,
  };

  constructor(private route: ActivatedRoute, private socket: SocketService, private toastr: ToastrService,
              private orderService: OrderService, private router: Router) {
    this.subscriptions = [];
  }

  ngOnInit() {
    this.subscriptions.push(this.route.params.subscribe(params => {
      this.orderId = params.id;
    }));
  }

  ngAfterViewInit() {
    this.subscriptions.push(this.orderService.getOrder(this.orderId).subscribe((order) => {
      if (order.status === OrderStatus.Completed || order.status === OrderStatus.FoodReady) {
        this.toastr.warning('This order is completed already, access it from the completed order tab', 'Order completed');
        this.router.navigateByUrl('cookOrders');
      } else {
        this.order = order;
      }
    }));

    this.subscriptions.push(this.socket.onTableStatusChanged().subscribe((tableId) => {
      if (this.order.table === tableId) {
        this.toastr.warning('The order you were inspecting has been cancelled', 'Order cancelled');
        this.router.navigateByUrl('cookOrders');
      }
    }));

    this.subscriptions.push(this.socket.onOrderStatusChanged().subscribe((res: any) => {
      if ( (res.status === OrderStatus.FoodReady ||  res.status === OrderStatus.Completed) && this.order._id === res.id) {
        this.toastr.warning('The order you were inspecting has been completed', 'Order completed');
        this.router.navigateByUrl('cookOrders');
      }
    }));

    this.subscriptions.push(this.socket.onOrderStatusCompleted().subscribe((orderId) => {
      if (this.order._id === orderId) {
        this.toastr.warning('The order you were inspecting has been completed', 'Order completed');
        this.router.navigateByUrl('cookOrders');
      }
    }));

    this.subscriptions.push(this.socket.onOrderDeleted().subscribe((res: any) => {
      if (this.order._id === res.id) {
        this.toastr.warning('The order you were inspecting has been deleted', 'Order Deleted');
        this.router.navigateByUrl('cookOrders');
      }
    }));

    this.subscriptions.push(this.socket.onElementStatusChanged().subscribe((res: any) => {
      if (this.order && this.order._id === res.id && this.order.food) {
        this.order.food.forEach( (element) => {
          if (element._id === res.elementId) {
            element.status = res.elementStatus;
          }
        });
      }
    }));

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  public toggleTab(tab: string) {
    this.tabs[tab] = !(this.tabs[tab]);
  }

  public isTabOpened(tab: string): boolean {
    return this.tabs[tab];
  }

  public getTags(): string[] {
    let tags = [];

    if (!this.order || !this.order.food) {
      return tags;
    }

    this.order.food.forEach((element) => {
      if (element.item.tag) {
        tags.push(element.item.tag);
      }
    });
    if (tags.length > 0) {
      tags = [...Array.from(new Set(tags))];
      // TypeScript only supports iterables on Arrays at the moment
      // tags = [...new Set(tags)];
    }

    return tags;
  }

  public getElementsByStatus(status: string): ElementER[] {
    if (!Object.values(ElementERStatus).includes(status)) {
      return [];
    }

    if (this.order && this.order.food) {
      return this.order.food.filter((element) => element.status === status);
    }
    return [];
  }

  public updateElementStatus(element: ElementER) {
    this.subscriptions.push(
      this.orderService.updateElement(this.orderId, element._id,
        element.status === ElementERStatus.Waiting ? ElementERStatus.Preparation : ElementERStatus.Completed)
        .subscribe((updatedOrder) => this.order = updatedOrder)
    );
  }
}
