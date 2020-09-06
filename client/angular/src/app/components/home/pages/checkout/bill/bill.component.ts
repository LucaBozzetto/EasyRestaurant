import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '@services/socket/socket.service';
import { TableService } from '@services/table/table.service';
import { concatMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Table } from '@models/table.model';
import { UserService } from '@services/user/user.service';
import { User } from '@models/user.model';
import { Order, OrderStatus } from '@models/order.model';
import { OrderService } from '@services/order/order.service';
import { ElementER } from '@models/element.model';
import { Item } from '@models/item.model';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscriptions: Subscription[];
  public tableId: string;
  public table: Table;
  public waiter: User;
  public orders: Order[];

  public userEntry: string;

  constructor(private route: ActivatedRoute, private socket: SocketService, private tableService: TableService,
              private toastr: ToastrService, private router: Router, private userService: UserService,
              private orderService: OrderService) {
    this.subscriptions = [];
    this.orders = [];
    this.tableId = '';
  }

  ngOnInit() {
    this.subscriptions.push(this.route.params.subscribe(params => {
      this.tableId = params.id;
    }));
  }

  ngAfterViewInit() {
    this.subscriptions.push(this.tableService.getSingleTable(this.tableId).pipe(
      concatMap( (newTable) => {
        if (newTable.free ) {
          this.toastr.warning('The table you were inspecting has been freed', 'Table freed');
          this.router.navigateByUrl('/tables');
        }
        this.table = newTable;

        return this.userService.listUsers();
      })
    ).subscribe((usersList) => {
      this.waiter = usersList.find( (user) => user._id === this.table.waiter);
    }));

    this.subscriptions.push(this.tableService.ordersList(this.tableId).subscribe( (ordersList) => this.orders = ordersList));

    this.subscriptions.push(this.socket.onTableStatusChanged().subscribe((id) => {
      if (this.tableId === id) {
        this.toastr.warning('The table you were inspecting has been freed', 'Table freed');
        this.router.navigateByUrl('/tables');
      }
    }));

    this.subscriptions.push(this.socket.onOrderAdded().pipe(
      concatMap( (res: any) => {
        return this.orderService.getOrder(res.id);
      })
    ).subscribe( (order) => {
      this.orders.push(order);
    }));

    this.subscriptions.push(this.socket.onOrderStatusCompleted().subscribe((orderId) => {
      const index = this.orders.findIndex( (order) => order._id === orderId);
      if (index > -1) {
        this.orders[index].status = OrderStatus.Completed;
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  public getAllElements(): ElementER[] {
    const elements = [];
    this.orders.forEach( (order) => {
      if (order.status === OrderStatus.Completed) {
        order.food.forEach( (element) => elements.push(element));
        order.beverage.forEach( (element) => elements.push(element));
      }
    });
    return elements;
  }

  private getExtras(element: ElementER): Item[] {
    const extras = [];
    element.extra.forEach( (item) => extras.push(item));
    return extras;
  }

  public getBill(): number {
    let total = 0;
    this.getAllElements().forEach(element => {
      total += element.quantity * element.item.price;
      element.extra.forEach( (extra) => {
        total += extra.price;
      });
    });
    return total;
  }

  public getExtraNames(element: ElementER) {
    const extras = this.getExtras(element);
    const names = [];
    extras.forEach( (item) => names.push(item.name));
    return names;
  }

  public getExtraTotal(element: ElementER) {
    const extras = this.getExtras(element);
    let total = 0;
    extras.forEach( (item) => total += item.price);
    return total;
  }

  public checkout() {
    this.subscriptions.push(this.tableService.freeTable(this.tableId).subscribe( (table) => this.router.navigateByUrl('/tables')));
  }

}
