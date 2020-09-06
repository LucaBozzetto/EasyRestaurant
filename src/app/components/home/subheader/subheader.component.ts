import { Component, OnInit, HostListener, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationStart, Event, NavigationEnd } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { Location } from '@angular/common';
import { TokenService } from '@services/token/token.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { AddTableDialogComponent } from './add-table-dialog/add-table-dialog.component';
import { concatMap } from 'rxjs/operators';
import { TableService } from '@services/table/table.service';
import { AddItemDialogComponent } from './add-item-dialog/add-item-dialog.component';
import { ItemService } from '@services/item/item.service';

@Component({
  selector: 'app-subheader',
  templateUrl: './subheader.component.html',
  styleUrls: ['./subheader.component.scss']
})
export class SubheaderComponent implements OnInit, OnDestroy, AfterViewInit {

  public isAdminToolsMenuOpened = false;

  public pageName: string;
  public subscriptions: Subscription[];
  public backButton = false;
  public backUrl = '';

  constructor(private router: Router, private location: Location, private tokenService: TokenService,
              public dialog: MatDialog, private tableService: TableService, private itemService: ItemService) {
    this.subscriptions = [];
    this.pageName = '';
  }

  ngOnInit() {
    this.updatePageBreadcrumb(this.router.url);
  }

  ngAfterViewInit() {
    // this.pageName = this.router.url;
    // console.log(this.router.url);

    this.subscriptions.push(this.router.events.subscribe ( (event: Event) => {
      if (event instanceof NavigationEnd) {
        this.updatePageBreadcrumb(this.router.url);
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  private updatePageBreadcrumb(path: string) {
    const urlChunks = path.split('/');

    if (urlChunks.length - 1 > 1) {
      this.backButton = true;
      this.backUrl = '';
      for (let i = 1; i < urlChunks.length - 1; i++) {
        this.backUrl += '/' + urlChunks[i];
      }
    } else {
      this.backButton = false;
      this.pageName = urlChunks[urlChunks.length - 1];
    }
  }

  public goBack() {
    this.router.navigateByUrl(this.backUrl);
  }

  public isUserAdmin(): boolean {
    const token = (this.tokenService.getToken());
    if (token) {
      const user = this.tokenService.getUserFromToken(token);
      return user.admin;
    }

    return false;
  }

  public openAdminToolsMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isAdminToolsMenuOpened = !this.isAdminToolsMenuOpened;
  }

  public addTable() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(AddTableDialogComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().pipe(
      concatMap( (seats) => {
        if (seats) {
          return this.tableService.addTable({seats});
        } else {
          return of(seats);
        }
      })
    ).subscribe());
  }


  public addItem() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(AddItemDialogComponent, dialogConfig);
    this.subscriptions.push(dialogRef.afterClosed().pipe(
      concatMap( (item) => {
        if (item) {
          return this.itemService.addItem(item);
        } else {
          return of(item);
        }
      })
    ).subscribe());
  }

  @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
      if (this.isAdminToolsMenuOpened === true) {
        this.isAdminToolsMenuOpened = false;
      }
    }
}
