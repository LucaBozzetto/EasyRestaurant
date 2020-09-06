import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { TablesComponent } from './pages/tables/tables.component';
import { SignedinGuardService } from '@services/guards/signedin-guard/signedin-guard.service';
import { AddElementsComponent } from './pages/table-details/add-order/add-elements/add-elements.component';
import { MenuComponent } from './pages/menu/menu.component';
import { CookOrdersComponent } from './pages/cook-orders/cook-orders.component';
import { CookOrderDetailsComponent } from './pages/cook-order-details/cook-order-details.component';
import { BarOrdersComponent } from './pages/bar-orders/bar-orders.component';
import { AdminSwitchComponent } from './pages/admin-switch/admin-switch.component';
import { BillComponent } from './pages/checkout/bill/bill.component';
import { RoleGuardService } from '@services/guards/role-guard/role-guard.service';
import { Role } from '@models/user.model';
import { ManagementComponent } from './pages/management/management.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu',
    pathMatch: 'full'
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [SignedinGuardService],
    children: [
      {
        path: 'tables',
        component: TablesComponent,
        canActivate: [RoleGuardService],
        data: {
          requiredRoles: [Role.Waiter, Role.Cashier],
        },
      },
      {
        path: 'tables/:id',
        component: AdminSwitchComponent,
        canActivate: [RoleGuardService],
        data: {
          requiredRoles: [Role.Waiter, Role.Cashier],
        },
      },
      {
        path: 'tables/:id/addElements',
        component: AddElementsComponent,
        canActivate: [RoleGuardService],
        data: {
          requiredRoles: [Role.Waiter],
        },
      },
      {
        path: 'tables/:id/bill',
        component: BillComponent,
        canActivate: [RoleGuardService],
        data: {
          requiredRoles: [Role.Cashier],
        },
      },
      {
        path: 'cookOrders',
        component: CookOrdersComponent,
        canActivate: [RoleGuardService],
        data: {
          requiredRoles: [Role.Cook],
        },
      },
      {
        path: 'cookOrders/:id',
        component: CookOrderDetailsComponent,
        canActivate: [RoleGuardService],
        data: {
          requiredRoles: [Role.Cook],
        },
      },
      {
        path: 'barOrders',
        component: BarOrdersComponent,
        canActivate: [RoleGuardService],
        data: {
          requiredRoles: [Role.Bar],
        },
      },
      {
        path: 'management',
        component: ManagementComponent,
        canActivate: [RoleGuardService],
        data: {
          requiredRoles: [Role.Cashier],
        },
      },
      {
        path: 'menu',
        component: MenuComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
