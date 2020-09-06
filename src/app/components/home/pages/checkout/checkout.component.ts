import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '@services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '@services/order/order.service';
import { Order, OrderStatus } from '@models/order.model';
import { TableService } from '@services/table/table.service';
import { Table } from '@models/table.model';
import { UserService } from '@services/user/user.service';
import { User } from '@models/user.model';
import { concatMap, tap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PendingOrdersDialogComponent } from './pending-orders-dialog/pending-orders-dialog.component';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {

  private subscriptions: Subscription[];
  public tableId: string;
  public table: Table;
  public tabs: any;
  public orders: Order[];
  public waiter: User;

  public completedTab: boolean;
  public waitingTab: boolean;

  constructor(private route: ActivatedRoute, private socket: SocketService, private toastr: ToastrService,
              private orderService: OrderService, private router: Router, private tableService: TableService,
              private userService: UserService, public dialog: MatDialog) {
    this.subscriptions = [];
    this.tabs = {};
    this.tableId = '';
    this.orders = [];
    this.completedTab = false;
    this.waitingTab = false;
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
          this.router.navigateByUrl('tables');
        }
        this.table = newTable;

        if (this.table.orders) {
          this.table.orders.forEach(order => {
            this.tabs[order] = false;
          });
        }

        return this.userService.listUsers();
      })
    ).subscribe((usersList) => {
      this.waiter = usersList.find( (user) => user._id === this.table.waiter);
    }));

    this.subscriptions.push(this.tableService.ordersList(this.tableId).subscribe( (ordersList) => this.orders = ordersList));

    this.subscriptions.push(this.socket.onTableStatusChanged().subscribe((id) => {
      if (this.tableId === id) {
        this.toastr.warning('The table you were inspecting has been freed', 'Table freed');
        this.router.navigateByUrl('tables');
      }
    }));

    this.subscriptions.push(this.socket.onOrderAdded().pipe(
      concatMap( (res: any) => {
        return this.orderService.getOrder(res.id);
      })
    ).subscribe( (order) => {
      this.orders.push(order);
    }));

    this.subscriptions.push(this.socket.onOrderStatusCompleted().pipe(
      concatMap( (orderId: string) => this.orderService.getOrder(orderId))
    ).subscribe((order) => {
      console.log('chiamato');
      this.orders = this.orders.filter( (elem) => elem._id !== order._id);
      this.orders.push(order);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  public getOrdersByStatus(status: string) {
    if (!Object.values(OrderStatus).includes(status)) {
      return [];
    }

    return this.orders.filter( (order) => {
      if (status === OrderStatus.Preparation) {
        return (order.status === status
          || order.status === OrderStatus.FoodReady
          || order.status === OrderStatus.BeverageReady);
      }
      return order.status === status;
    });
  }

  public toggleTab(id: string) {
    const index = this.orders.findIndex( (order) => {
      return order._id === id;
    });

    if (index > -1) {
      this.tabs[id] = !this.tabs[id];
    }
  }

  public isOrderTabOpened(id: string) {
    if (this.tabs[id]) {
      return this.tabs[id];
    }
    return false;
  }

  private openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    const dialogRef = this.dialog.open(PendingOrdersDialogComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().pipe(
      tap( (response) => {
        if (response) {
          this.router.navigate(['./bill'], { relativeTo: this.route });
        }
      })
    ).subscribe());
  }

  public openBill() {
    if (this.getOrdersByStatus(OrderStatus.Preparation).length > 0) {
      this.openDialog();
    } else {
      this.router.navigate(['./bill'], { relativeTo: this.route });
    }
  }
}
