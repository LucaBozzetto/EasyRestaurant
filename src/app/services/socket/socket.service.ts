import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { TokenService } from '@services/token/token.service';
import { NotificationService } from '@services/notification/notification.service';
import { OrderStatus } from '@models/order.model';
import { ElementERStatus } from '@models/element.model';

export enum SocketEvents {
  USER_AUTHENTICATED = 'user-authenticated',
  USER_SIGNED_UP = 'user-signed-up',
  USER_SIGNED_OUT = 'user-signed-out',
  USER_PROMOTED = 'user-promoted',
  USER_DELETED = 'user-deleted',
  TABLE_STATUS_CHANGED = 'table-status-changed',
  TABLE_ADDED = 'table-added',
  ORDER_ADDED = 'order-added',
  ORDER_STATUS_CHANGED = 'order-status-changed',
  ORDER_COMPLETED = 'order-completed',
  ORDER_CHECKEDOUT = 'order-checkedout',
  ORDER_DELETED = 'order-deleted',
  NEW_NOTIFICATION = 'new-notification',
  DELETED_NOTIFICATION = 'deleted-notification',
  TABLE_NOTIFICATIONS_DELETED = 'table-notifications-deleted',
  ELEMENT_STATUS_CHANGED = 'element-status-changed',
  STATISTIC_UPDATED = 'statistic-updated',
  ITEM_ADDED = 'item-added',
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: SocketIOClient.Socket;

  constructor(private tokenService: TokenService, private notificationService: NotificationService) {
    this.socket = io(environment.serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
  }

  public disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  public onReconnectSuccess() {
    return new Observable(observer => {
      this.socket.on('reconnect', (attemptNumber) => {
        observer.next();
      });
    }).pipe(
      tap( () => {
        const token = this.tokenService.getToken();
        if (token) {
          const user = this.tokenService.getUserFromToken(token);
          this.broadcast(SocketEvents.USER_AUTHENTICATED, `{"id": "${user._id}", "role": "${user.role}"}`);
        }
      })
    );
  }

  public onReconnectFailed() {
    return new Observable(observer => {
      this.socket.on('reconnect_failed', () => {
        // console.log('Impossibile riconnettersi!');
        observer.next();
      });
    });
  }

  public onDeletedNotification() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.TABLE_NOTIFICATIONS_DELETED, (tableId) => {
        observer.next(tableId);
      });
    });
  }

  public broadcast(event: SocketEvents, message: string) {
    this.socket.emit(event, message);
  }

  public onTableStatusChanged() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.TABLE_STATUS_CHANGED, (tableId: string) => observer.next(tableId));
    });
  }

  public onTableAdded() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.TABLE_ADDED, () => observer.next());
    });
  }

  public onNewNotification() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.NEW_NOTIFICATION, (notificationId: string) => {
        observer.next(notificationId);
      });
    }).pipe(
      concatMap( (notificationId: string) => {
        return this.notificationService.getNotification(notificationId);
      })
    );
  }

  public onOrderStatusCompleted() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.ORDER_COMPLETED, (orderId: string) => observer.next(orderId));
    });
  }

  public onOrderCheckedout() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.ORDER_CHECKEDOUT, (orderId: string) => observer.next(orderId));
    });
  }

  public onOrderAdded() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.ORDER_ADDED, (res: {id: string, status: OrderStatus}) => observer.next(res));
    });
  }

  public onOrderDeleted() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.ORDER_DELETED, (res: {id: string, status: OrderStatus}) => observer.next(res));
    });
  }

  public onOrderStatusChanged() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.ORDER_STATUS_CHANGED,
        (res: {id: string, status: OrderStatus, previousStatus: OrderStatus}) => observer.next(res));
    });
  }

  public onElementStatusChanged() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.ELEMENT_STATUS_CHANGED, (res: {id: string, status: OrderStatus,
        elementId: string, elementStatus: ElementERStatus}) => observer.next(res));
    });
  }

  public onUserPromoted() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.USER_PROMOTED, (userId) => observer.next(userId));
    });
  }

  public onUserDeleted() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.USER_DELETED, (userId) => observer.next(userId));
    });
  }

  public onStatisticUpdated() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.STATISTIC_UPDATED, (userId) => observer.next(userId));
    });
  }

  public onUserSignedUp() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.USER_SIGNED_UP, (username) => observer.next(username));
    });
  }

  public onItemAdded() {
    return new Observable(observer => {
      this.socket.on(SocketEvents.ITEM_ADDED, () => observer.next());
    });
  }

}
