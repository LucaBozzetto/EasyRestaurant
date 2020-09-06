import { Component, OnInit } from '@angular/core';
import { UserService } from '@services/user/user.service';
import { Role } from '@models/user.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-switch',
  templateUrl: './admin-switch.component.html',
  styleUrls: ['./admin-switch.component.scss']
})
export class AdminSwitchComponent implements OnInit {

  constructor(private userService: UserService, private router: Router, private toastr: ToastrService) { }

  ngOnInit() {
  }

  public isAdmin(): boolean {
    const user = this.userService.getUser();

    if (user && user.role !== Role.Waiter && user.role !== Role.Cashier) {
      this.toastr.warning('This fuctionality is not accesible to users with your role.', 'Waiter and Admin reserved page');
      this.router.navigateByUrl('/');
    }

    if (user) {
      return user.admin;
    }

    return false;
  }

}
