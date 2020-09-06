import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { HeaderMobileComponent } from './header-mobile/header-mobile.component';
import { HeaderComponent } from './header/header.component';
import { SubheaderComponent } from './subheader/subheader.component';
import { CommonModule } from '@angular/common';
import { UserBarComponent } from './header/user-bar/user-bar.component';
import { NotificationsComponent } from './header/notifications/notifications.component';
import { HomeRoutingModule } from './home-routing.module';
import { TablesComponent } from './pages/tables/tables.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from 'src/app/services/token/token.interceptor';
import { AccomodateDialogComponent } from './pages/tables/accomodate-dialog/accomodate-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TableDetailsComponent } from './pages/table-details/table-details.component';
import { OrdersListComponent } from './pages/table-details/orders-list/orders-list.component';
import { AddOrderComponent } from './pages/table-details/add-order/add-order.component';
import { AddElementsComponent } from './pages/table-details/add-order/add-elements/add-elements.component';
import { FormsModule } from '@angular/forms';
// tslint:disable-next-line: max-line-length
import { SelectQuantityDialogComponent } from './pages/table-details/add-order/add-elements/select-quantity-dialog/select-quantity-dialog.component';
import { EditElementDialogComponent } from './pages/table-details/add-order/edit-element-dialog/edit-element-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MenuComponent } from './pages/menu/menu.component';
import { CookOrdersComponent } from './pages/cook-orders/cook-orders.component';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { CookOrderDetailsComponent } from './pages/cook-order-details/cook-order-details.component';
import { BarOrdersComponent } from './pages/bar-orders/bar-orders.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { AdminSwitchComponent } from './pages/admin-switch/admin-switch.component';
import { PendingOrdersDialogComponent } from './pages/checkout/pending-orders-dialog/pending-orders-dialog.component';
import { BillComponent } from './pages/checkout/bill/bill.component';
import { ManagementComponent } from './pages/management/management.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AddTableDialogComponent } from './subheader/add-table-dialog/add-table-dialog.component';
import { AddItemDialogComponent } from './subheader/add-item-dialog/add-item-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatSliderModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    MatIconModule,
    MatListModule,
    NgxChartsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    MatDialog
  ],
  entryComponents: [
    AccomodateDialogComponent,
    SelectQuantityDialogComponent,
    EditElementDialogComponent,
    PendingOrdersDialogComponent,
    AddTableDialogComponent,
    AddItemDialogComponent,
  ],
  declarations: [
    FilterPipe,
    HomeComponent,
    HeaderMobileComponent,
    HeaderComponent,
    SubheaderComponent,
    UserBarComponent,
    NotificationsComponent,
    TablesComponent,
    AccomodateDialogComponent,
    SelectQuantityDialogComponent,
    EditElementDialogComponent,
    PendingOrdersDialogComponent,
    AddTableDialogComponent,
    AddItemDialogComponent,
    TableDetailsComponent,
    OrdersListComponent,
    AddOrderComponent,
    AddElementsComponent,
    MenuComponent,
    CookOrdersComponent,
    CookOrderDetailsComponent,
    BarOrdersComponent,
    CheckoutComponent,
    AdminSwitchComponent,
    BillComponent,
    ManagementComponent,
  ]
})
export class HomeModule { }
