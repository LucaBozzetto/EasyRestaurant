import { Component, OnInit, HostListener, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { NotificationER } from '@models/notification.model';
import { Subscription } from 'rxjs';
import { NotificationService } from '@services/notification/notification.service';
import { SocketService } from '@services/socket/socket.service';
import { NotificationSharingService } from '@services/notification/notification-sharing/notification-sharing.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy, AfterViewInit {

  public dropdown = false;
  public tabAllActive = true;
  public tabFoodActive = false;
  public tabBeverageActive = false;

  private subscriptions: Subscription[];

  public notifications: NotificationER[];

  constructor(private eRef: ElementRef, private notificationService: NotificationService, private socket: SocketService,
              private notificationSharing: NotificationSharingService) {
    this.notifications = [];
    this.subscriptions = [];
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.subscriptions.push(this.notificationService.getAllNotifications().subscribe( (notificationsList) => {
      this.notifications = notificationsList;
      this.notificationSharing.updateNotification(this.notifications);

    }));
    this.subscriptions.push(this.socket.onNewNotification().subscribe((notification) => {
      this.notifications.push(notification);
      this.notificationSharing.updateNotification(this.notifications);
    }));
    this.subscriptions.push(this.socket.onDeletedNotification().subscribe((tableId) => {
      this.notifications = this.notifications.filter( (elem) => {
        return elem.table === tableId ? false : true;
      });
      this.notificationSharing.updateNotification(this.notifications);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  public openDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.dropdown = !this.dropdown;
    document.querySelector('body').style.cssText = '--index-test: 1';
  }

  public get dropDown() {
    return this.dropdown;
  }

  public setTabAllActive() {
    this.tabAllActive = true;
    this.tabFoodActive = false;
    this.tabBeverageActive = false;
  }

  public setTabFoodActive() {
    this.tabAllActive = false;
    this.tabFoodActive = true;
    this.tabBeverageActive = false;
  }

  public setTabBeverageActive() {
    this.tabAllActive = false;
    this.tabFoodActive = false;
    this.tabBeverageActive = true;
  }

  public getNotifications() {
    return this.notifications.filter( (elem) => {
      if (this.tabFoodActive) {
        return elem.bar === false;
      } else if (this.tabBeverageActive) {
        return elem.bar === true;
      } else {
        return elem;
      }
    });
  }

  public readNotification(notificationId: string) {
    this.subscriptions.push(this.notificationService.readNotification(notificationId).subscribe( (deletedNotification) => {
      this.notifications = this.notifications.filter( (notification) => {
        return notification._id !== deletedNotification._id;
      });
      this.notificationSharing.updateNotification(this.notifications);
    }));
  }

  private closeNotificationMenu() {
    if (this.dropdown === true) {
      this.dropdown = false;
      document.querySelector('body').style.cssText = '--index-test: 97';
    }
  }

  @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
      event.stopPropagation();

      if (this.eRef.nativeElement.contains(event.target)) {
        // inside
      } else {
        // outside
        this.closeNotificationMenu();
      }
    }

}
