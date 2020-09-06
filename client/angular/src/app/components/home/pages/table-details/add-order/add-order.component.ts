import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { OrderService } from '@services/order/order.service';
import { ElementER } from '@models/element.model';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { Subscription, of } from 'rxjs';
import { EditElementDialogComponent } from './edit-element-dialog/edit-element-dialog.component';
import { concatMap } from 'rxjs/operators';
import { ItemType } from '@models/item.model';
import { UserService } from '@services/user/user.service';
import { TableService } from '@services/table/table.service';

@Component({
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss']
})
export class AddOrderComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() tableId: string;

  public elements: any[];
  private subscriptions: Subscription[];
  public isMyTable: boolean;
  public sending: boolean;

  constructor(private orderService: OrderService, public dialog: MatDialog, private userService: UserService,
              private tableService: TableService) {
    this.elements = [];
    this.subscriptions = [];
    this.isMyTable = true;
    this.sending = false;
  }

  ngOnInit() {
    this.elements = this.orderService.getTemporaryOrder(this.tableId);

    this.subscriptions.push(this.tableService.getSingleTable(this.tableId).subscribe( (table) => {
      const user = this.userService.getUser();

      if (user) {
        this.isMyTable = user._id === table.waiter;
      } else {
        this.isMyTable = false;
      }
    }));
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  public placeOrder() {
    if (this.sending) {
      return;
    }
    this.sending = true;

    const order: any = {
      food: [],
      beverage: [],
    };

    this.elements.forEach( (elem) => {
      const obj: any = {};

      if (elem.type === ItemType.Food) {
        // If we have any extra ingredient
        if (elem.extra && elem.extra.length > 0) {
          obj.extra = [];
          elem.extra.forEach( (entry) => obj.extra.push(entry._id));
        }

        // If we have any note
        if (elem.note) {
          obj.note = elem.note;
        }

        obj.item = elem.item;
        obj.quantity = elem.quantity;

        order.food.push(obj);
      } else if (elem.type === ItemType.Beverage) {
        // beverage
        obj.item = elem.item;
        obj.quantity = elem.quantity;

        order.beverage.push(obj);
      }
    });

    if (this.elements.length < 1) {
      this.sending = false;
      return;
    }

    this.subscriptions.push(this.orderService.placeOrder(this.tableId, order).subscribe( (newOrder) => {
      this.elements = [];
      this.orderService.deleteTemporaryOrder(this.tableId);
      this.sending = false;
    }));
  }

  public updateElementQuantity(elementIndex: number, increase: boolean) {
    this.orderService.updateElementQuantity(this.tableId, elementIndex, increase);
    if (this.elements[elementIndex].quantity === 0) {
      this.elements = this.orderService.getTemporaryOrder(this.tableId);
    }
  }

  public deleteTemporaryElement(elementIndex: number) {
    this.elements = this.orderService.deleteTemporaryElement(this.tableId, elementIndex);
  }

  public openEditElementDialog(elementIndex) {

    const elem = this.elements[elementIndex];

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      itemId: elem.item,
      name: elem.name,
      note: elem.note,
      extra: elem.extra,
    };

    const dialogRef = this.dialog.open(EditElementDialogComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().pipe(
      concatMap( (obj: any) => {
        if (obj && obj.note) {
          elem.note = obj.note;
        } else {
          elem.note = '';
        }

        if (obj && obj.ingredients) {
          elem.extra = obj.ingredients;
        } else {
          elem.extra = [];
        }

        return of(this.orderService.updateTemporaryElement(this.tableId, elementIndex, elem));
      })
    ).subscribe());
  }

}
