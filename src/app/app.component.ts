import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { TokenService } from '@services/token/token.service';
import { SocketService, SocketEvents } from '@services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '@services/user/user.service';
import { concatMap } from 'rxjs/operators';
import { environment } from '@env/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnDestroy {
  title = 'easyrestaurant';

  subscriptions: Subscription[];
  initialHref;

  constructor(private router: Router, private tokenService: TokenService, private socket: SocketService,
              private toastr: ToastrService, private userService: UserService) {

    // keep startup url (in case your app is an SPA with html5 url routing)
    if (environment.mobile) {
      this.initialHref = window.location.href;
    }

    this.subscriptions = [];
    this.subscriptions.push(router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {

          // !router.navigated = browserRefresh
          if (!router.navigated) {
            const token = this.tokenService.getToken();
            if (token) {
              const user = this.tokenService.getUserFromToken(token);
              this.socket.broadcast(SocketEvents.USER_AUTHENTICATED, `{"id": "${user._id}", "role": "${user.role}"}`);
            }
            // console.log('refreshed');
          }
        }
    }));

    this.subscriptions.push(socket.onReconnectFailed().pipe(
      concatMap( () => {
        return this.toastr.error(`The connection with our backend has been lost, please check your internet
        connection and click here to reload the app.`, 'Connection lost', {disableTimeOut: true, closeButton: true}).onTap;
      })
    ).subscribe(
      (activeToast) => {
        if (environment.mobile) {
          // navigator.splashscreen.show();
          // Reload original app url (ie your index.html file)
          location = this.initialHref;
        } else {
          location.reload();
        }
      }));

    this.subscriptions.push(socket.onReconnectSuccess().subscribe(
      () => this.toastr.success(`The connection with our backend has been re-established`, 'Connection Re-established')));

    this.subscriptions.push(socket.onUserPromoted().subscribe((userId) => {
      const token = this.tokenService.getToken();
      if (token) {
        const user = this.tokenService.getUserFromToken(token);
        if (user._id === userId) {
          this.toastr.warning(`You have been promoted to admin, please login again`, 'User promoted');
          this.userService.logout();
        }
      }
    }));

    this.subscriptions.push(socket.onUserDeleted().subscribe((userId) => {
      const token = this.tokenService.getToken();
      if (token) {
        const user = this.tokenService.getUserFromToken(token);
        if (user._id === userId) {
          this.toastr.warning(`Your user has been deleted. Please contact your employer.`, 'User deleted');
          this.userService.logout();
        }
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
