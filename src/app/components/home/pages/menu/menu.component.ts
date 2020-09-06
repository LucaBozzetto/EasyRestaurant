import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Item, ItemType } from '@models/item.model';
import { ItemService } from '@services/item/item.service';
import { SocketService } from '@services/socket/socket.service';
import { concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[];
  public food: Item[];
  public beverage: Item[];
  public tags: string[];
  public tabs: any;

  public foodEntry: string;
  public beverageEntry: string;

  constructor(private itemService: ItemService, private socket: SocketService) {
    this.subscriptions = [];
    this.food = [];
    this.beverage = [];
    this.tags = [];
    this.tabs = {};
  }

  ngOnInit() {
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

    this.subscriptions.push(this.socket.onItemAdded().pipe(
      concatMap( () => {
          return this.itemService.getItemList();
      })).subscribe( (itemList) => {
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

}
