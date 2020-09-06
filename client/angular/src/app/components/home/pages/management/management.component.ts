import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Order, OrderStatus } from '@models/order.model';
import { OrderService } from '@services/order/order.service';
import { User, Role } from '@models/user.model';
import { UserService } from '@services/user/user.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { StatisticService } from '@services/statistic/statistic.service';
import { Statistic } from '@models/statistic.model';
import { concatMap, concat } from 'rxjs/operators';
import { SocketService } from '@services/socket/socket.service';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit, OnDestroy, AfterViewInit {

  private subscriptions: Subscription[];
  public orders: Order[];
  public queueLength: number;
  public users: User[];
  public statistics: Statistic[];

  public chart: any;

  public userEntry: string;

  constructor(private orderService: OrderService, private userService: UserService, private statisticService: StatisticService,
              private socket: SocketService) {
    this.subscriptions = [];
    this.orders = [];
    this.queueLength = 0;
    this.users = [];
    this.statistics = [];

    this.chart = {};
    // options
    this.chart.showXAxis = true;
    this.chart.showYAxis = true;
    this.chart.gradient = false;
    this.chart.showXAxisLabel = true;
    this.chart.xAxisLabel = 'Date';
    this.chart.showYAxisLabel = true;
    this.chart.autoScale = true;
    this.chart.yAxisLabel = 'Customers Served';
    this.chart.multi = {};

    this.chart.colorScheme = {
      domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    };
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.subscriptions.push(this.orderService.listOrders({status: OrderStatus.Checkedout, date: new Date()}).subscribe( (ordersList) => {
      this.orders = ordersList;
    }));

    this.subscriptions.push(this.orderService.listOrders().subscribe( (ordersList) => {
      ordersList.forEach( (order) => {
        if (order.status !== OrderStatus.FoodReady && order.status !== OrderStatus.Completed) {
          this.queueLength++;
        }
      });
    }));

    this.subscriptions.push(this.statisticService.listStatistics().pipe(
      concatMap( (statisticsList) => {
        this.statistics = statisticsList;
        return this.userService.listUsers();
      })
    ).subscribe((usersList) => {
      this.users = usersList;
      this.users.forEach( (user) => {
        if (user.role === Role.Waiter) {
          this.generateOrdersData(user._id);
        } else if (user.role === Role.Cook) {
          this.generateTagData(user._id);
        }
      });
    }));

    this.subscriptions.push(this.socket.onStatisticUpdated().pipe(
      concatMap( (userId: string) => {
        return this.statisticService.getStatistic(userId);
      })
    ).subscribe( (statistic) => {
      const index = this.statistics.findIndex((elem) => elem.user === statistic.user);
      if (index > -1) {
        this.statistics[index] = statistic;
      } else {
        this.statistics.push(statistic);
      }

      const user = this.users.find((elem) => elem._id === statistic.user);
      if (user && user.role === Role.Waiter) {
        this.generateOrdersData(user._id);
      } else if (user && user.role === Role.Cook) {
        this.generateTagData(user._id);
      }
    }));

    this.subscriptions.push(this.socket.onUserPromoted().subscribe( (userId) => {
      const index = this.users.findIndex((user) => user._id === userId);
      if (index > -1) {
        this.users[index].admin = true;
      }
    }));

    this.subscriptions.push(this.socket.onUserDeleted().subscribe( (userId) => {
      this.users = this.users.filter((user) => user._id !== userId);
    }));

    this.subscriptions.push(this.socket.onUserSignedUp().pipe(
      concatMap( (username: string) => {
        return this.userService.getUserFromUsername(username);
      })
    ).subscribe( (user) => {
      this.users.push(user);
    }));

    this.subscriptions.push(this.socket.onOrderCheckedout().pipe(
      concatMap( (orderId: string) => this.orderService.getOrder(orderId))
    ).subscribe( (order) => this.orders.push(order)));

    this.subscriptions.push(this.socket.onOrderAdded().subscribe((res: any) => {
      if (res.status !== OrderStatus.FoodReady && res.status !== OrderStatus.Completed) {
        this.queueLength++;
      }
    }));
    this.subscriptions.push(this.socket.onOrderDeleted().subscribe((res: any) => {
      if (res.status === OrderStatus.BeverageReady || res.status !== OrderStatus.Preparation) {
        this.queueLength--;
      }
    }));

    this.subscriptions.push(this.socket.onOrderStatusChanged().subscribe((res: any) => {
      if ( (res.previousStatus === OrderStatus.Preparation && res.status === OrderStatus.FoodReady)
        || (res.previousStatus === OrderStatus.Preparation && res.status === OrderStatus.Completed)
        || (res.previousStatus === OrderStatus.BeverageReady && res.status === OrderStatus.Completed) ) {
        this.queueLength--;
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  private isToday(isoDate: string) {
    const today = new Date();
    const date = new Date(isoDate);

    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth()
      && date.getFullYear() === today.getFullYear();
  }

  public getTodayTotal(): number {
    let total = 0;

    this.orders.forEach( (order) => {
      // Count only today's orders
      if (this.isToday(order.submittedAt) && order.status === OrderStatus.Checkedout) {

        // Sum food prices
        if (order.food) {
          order.food.forEach( (element) => {
            total += element.quantity * element.item.price;

            if (element.extra) {
              element.extra.forEach((extra) => total += extra.price);
            }
          });
        }

        // Sum beverage prices
        if (order.beverage) {
          order.beverage.forEach( (element) => total += element.quantity * element.item.price);
        }
      }
    });

    return total;
  }

  public getUserClass(role: Role) {
    const classes = 'kt-widget__pic kt-font-boldest kt-font-light ';
    if (role === Role.Cashier) {
      return classes + ' kt-widget__pic--danger kt-font-danger';
    }

    if (role === Role.Bar) {
      return classes + 'kt-widget__pic--warning kt-font-warning';
    }

    if (role === Role.Cook) {
      return classes + 'kt-widget__pic--brand kt-font-primary';
    }

    if (role === Role.Waiter) {
      return classes + 'kt-widget__pic--success kt-font-success';
    }

    return classes;
  }

  private dateTickFormatting(val: any): string {
    const date = new Date(val);
    // const options = { month: 'long' };
    return date.toLocaleDateString();
  }

  public customersServedByUser(user: User) {
    if (user.role === Role.Waiter) {
      const statistic = this.statistics.find( (stat) => stat.user === user._id);
      if (statistic && statistic.customersServed > 0) {
        return statistic.customersServed;
      }
    }

    return 0;
  }

  public dishesPrepared(user: User) {
    if (user.role === Role.Cook) {
      const statistic = this.statistics.find( (stat) => stat.user === user._id);
      if (statistic && statistic.dishesPrepared > 0) {
        return statistic.dishesPrepared;
      }
    }

    return 0;
  }

  public hasHistoricData(user: User) {
    if (user.role === Role.Waiter) {
      const statistic = this.statistics.find( (stat) => stat.user === user._id);
      if (statistic && statistic.customersHistory) {
        return statistic.customersHistory.length > 0;
      }
      return false;
    }

    if (user.role === Role.Cook) {
      const statistic = this.statistics.find( (stat) => stat.user === user._id);
      if (statistic && statistic.tags) {
        return statistic.tags.length > 0;
      }
      return false;
    }

    return false;
  }

  private generateOrdersData(userId) {
    this.chart.multi[userId]  = [{
      name: 'Customers Served',
      series: []
    }];

    const statistic = this.statistics.find( (stat) => stat.user === userId);
    if (statistic) {
      // Sort the dates so the chart has a meaning
      statistic.customersHistory.sort((a, b) => {
        const dateA = new Date(a.date).toISOString();
        const dateB = new Date (b.date).toISOString();
        return dateA.localeCompare(dateB);
      });

      statistic.customersHistory.forEach( (elem) => {
        this.chart.multi[userId][0].series.push({value: elem.customers, name: elem.date});
      });
    }
  }

  private generateTagData(userId) {
    this.chart.multi[userId] = [];

    const statistic = this.statistics.find( (stat) => stat.user === userId);
    if (statistic) {
      statistic.tags.forEach( (elem) => {
        const titleCaseTag = elem.tag.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        this.chart.multi[userId].push({value: elem.occurences, name: titleCaseTag});
      });
    }
  }

  public makeAdmin(user: User) {
    this.subscriptions.push(this.userService.updateUser(user.username).subscribe( (newUser) => {
      const index = this.users.findIndex( (elem) => elem._id === user._id);
      this.users[index] = newUser;
    }));
  }

  public dismiss(user: User) {
    this.subscriptions.push(this.userService.deleteUser(user.username).subscribe( (deletedUser) => {
      this.users = this.users.filter((elem) => elem._id !== user._id);
    }));
  }

}
