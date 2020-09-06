import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { SocketService } from '@services/socket/socket.service';
import { Subscription, Observable, empty, of } from 'rxjs';
import { TableService } from '@services/table/table.service';
import { Table } from '@models/table.model';
import { NotificationER } from '@models/notification.model';
import { NotificationSharingService } from '@services/notification/notification-sharing/notification-sharing.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { AccomodateDialogComponent } from './accomodate-dialog/accomodate-dialog.component';
import { concatMap, tap } from 'rxjs/operators';
import { NotificationService } from '@services/notification/notification.service';
import { TokenService } from '@services/token/token.service';
import { UserService } from '@services/user/user.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss']
})
export class TablesComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[];

  public tables: Table[];
  public table: Table;
  public notifications: NotificationER[];
  public isAdmin: boolean;

  constructor(private socket: SocketService, private tableService: TableService, private notificationSharing: NotificationSharingService,
              public dialog: MatDialog, private userService: UserService) {
    this.subscriptions = [];
    this.notifications = [];
    this.isAdmin = false;
  }

  ngOnInit() { }

  ngAfterViewInit() {
    const user = this.userService.getUser();
    if (user) {
      this.isAdmin = user.admin;
    }

    this.subscriptions.push(this.tableService.listAllTables().subscribe((tablesList) => this.tables = tablesList));
    this.subscriptions.push(this.socket.onTableAdded().pipe(
      concatMap(() => this.tableService.listAllTables())
    ).subscribe((tablesList) => this.tables = tablesList));

    if (!this.isAdmin) {
      this.subscriptions.push(this.notificationSharing.notificationList.subscribe((update) => this.notifications = update));
    }

    this.subscriptions.push(this.socket.onTableStatusChanged().pipe(
      concatMap( (tableId: string) => {
        return this.tableService.getSingleTable(tableId);
      })
    ).subscribe((table) => {
      const index = this.tables.findIndex(elem => elem._id === table._id);
      if (index > -1) {
        this.tables[index] = table;
      } else {
        console.log('error');
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  public getTableLink(table: Table) {
    if (!table.free) {
      return `/tables/${table._id}`;
    }
    return null;
  }

  public getCardStyle(table: Table) {
    const orderReady = this.hasOrderReady(table);

    const styleObj = {
      'table-free': table.free && !orderReady,
      'table-occupied': !table.free && !orderReady,
      'table-order': !table.free && orderReady && !this.isAdmin,
    };

    return styleObj;
  }

  public getStatusStyle(table: Table) {
    const orderReady = this.hasOrderReady(table);

    const styleObj = {
      'table-status-free': table.free && !orderReady,
      'table-status-occupied': !table.free && !orderReady,
      'table-status-order': !table.free && orderReady && !this.isAdmin,
    };

    return styleObj;
  }

  public getSeatsStyle(table: Table) {
    const orderReady = this.hasOrderReady(table);

    const styleObj = {
      'table-seats-free': table.free && !orderReady,
      'table-seats-occupied': !table.free && !orderReady,
      'table-seats-order': !table.free && orderReady && !this.isAdmin,
    };

    return styleObj;
  }

  public getMessageText(table: Table): string {
    if (!table.free) {
      const notification = this.hasOrderReady(table);
      if (notification && !this.isAdmin) {
        const type = notification.bar ? 'Beverage' : 'Food';
        return `${type} ready!`;
      }
      return `Maximum seats: ${table.seats}`;
    }
    return 'No reservations yet';
  }

  public openDialog(table: Table) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      tableNumber: table.tableNumber,
      seats: table.seats
    };

    const dialogRef = this.dialog.open(AccomodateDialogComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().pipe(
      concatMap( (customers) => {
        if (customers) {
          return this.tableService.occupyTable(customers, table._id);
        } else {
          return of(customers);
        }
      })
    ).subscribe());
  }

  private hasOrderReady(table: Table) {
    const result = this.notifications.find( (notification) => {
      return notification.table === table._id;
    });

    return result;
  }

}

