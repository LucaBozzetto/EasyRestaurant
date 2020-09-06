import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationER } from '@models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationSharingService {

public notificationList: BehaviorSubject<NotificationER[]>;

constructor() {
  this.notificationList = new BehaviorSubject<NotificationER[]>([]);
}

public updateNotification(notifications: NotificationER[]) {
  this.notificationList.next(notifications);
}

}
