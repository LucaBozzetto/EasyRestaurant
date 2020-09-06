import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '@services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '@services/token/token.service';
import { Role } from '@models/user.model';
import { OrderStatus } from '@models/order.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription[];

  constructor(private socket: SocketService, private toastr: ToastrService, private tokenService: TokenService) {
    this.subscriptions = [];
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    const token = this.tokenService.getToken();
    if (token) {
      const user = this.tokenService.getUserFromToken(token);
      if (user && user.role === Role.Cook) {
        this.subscriptions.push(this.socket.onOrderAdded().subscribe( (res: any) => {
          if (res.status === OrderStatus.Preparation || res.status === OrderStatus.BeverageReady) {
            this.toastr.info('Duty is calling, an order has been submitted to the kitchen!', 'Order Added');
          }
        }));
      } else if (user && user.role === Role.Bar) {
        this.subscriptions.push(this.socket.onOrderAdded().subscribe( (res: any) => {
          if (res.status === OrderStatus.Preparation || res.status === OrderStatus.FoodReady) {
            this.toastr.info('Duty is calling, an order has been submitted to the bar!', 'Order Added');
          }
        }));
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
