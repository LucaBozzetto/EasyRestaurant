import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ItemService } from '@services/item/item.service';
import { Item, ItemType } from '@models/item.model';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { SelectQuantityDialogComponent } from './select-quantity-dialog/select-quantity-dialog.component';
import { OrderService } from '@services/order/order.service';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-add-elements',
  templateUrl: './add-elements.component.html',
  styleUrls: ['./add-elements.component.scss']
})
export class AddElementsComponent implements OnInit, OnDestroy {

  public tableId: string;
  private subscriptions: Subscription[];
  public food: Item[];
  public beverage: Item[];
  public tags: string[];
  public tabs: any;

  public foodEntry: string;
  public beverageEntry: string;

  constructor(private route: ActivatedRoute, private itemService: ItemService,
              public dialog: MatDialog, private orderService: OrderService) {
    this.tableId = '';
    this.subscriptions = [];
    this.food = [];
    this.beverage = [];
    this.tags = [];
    this.tabs = {};
  }

  ngOnInit() {
    this.subscriptions.push(this.route.params.subscribe(params => {
      this.tableId = params.id;
    }));
    this.subscriptions.push(this.itemService.getItemList().subscribe( (itemList) => {
      this.food = itemList.filter( (item) => item.type === ItemType.Food);
      this.beverage = itemList.filter( (item) => item.type === ItemType.Beverage);
      itemList.forEach( (item) => {
        if (item.tag) {
          this.tags.push(item.tag);
        }
      });
      // this returns a new array without duplicates
      this.tags = [...Array.from(new Set(this.tags))];
      // TypeScript only supports iterables on Arrays at the moment
      // this.tags = [...new Set(this.tags)];

      this.tags.forEach( (tag) => this.tabs[tag] = false);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  public toggleTab(tab: string) {
    this.tabs[tab] = !this.tabs[tab];
  }

  public getItemsByTag(itemList: Item[], tag: string) {
    return itemList.filter((item) => item.tag === tag);
  }

  public openSelectQuantityDialog(item) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      itemId: item._id,
      name: item.name,
    };

    const dialogRef = this.dialog.open(SelectQuantityDialogComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().pipe(
      concatMap( (quantity) => {
        if (quantity) {
          return of(this.orderService.addTemporaryElement(this.tableId, {item: item._id, quantity, name: item.name, type: item.type}));
        } else {
          return of(quantity);
        }
      })
    ).subscribe());
  }
}
