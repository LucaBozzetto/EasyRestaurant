import { Component, OnInit, ViewContainerRef, OnDestroy } from '@angular/core';
import { Role } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user/user.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, OnDestroy {
  public username: string;
  public name: string;
  public surname: string;
  public password: string;
  public confirmPassword: string;
  public role: string;
  public wage: number;

  public roles: string[];

  public formSubmitted = false;

  private subscriptions: Subscription[];

  constructor(public viewContainerRef: ViewContainerRef, public userService: UserService) {
    this.roles = Object.values(Role).filter( (role) => role !== Role.Cashier);
    this.subscriptions = [];
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  getParentComponent() {
    // tslint:disable-next-line: no-string-literal
    return this.viewContainerRef['_data'].componentView.component.viewContainerRef['_view'].component;
  }

  public setLoginActive() {
    this.getParentComponent().setLoginActive();
  }

  public validRole() {
    return (this.role && this.role !== Role.Cashier);
  }

  public register(form: NgForm) {
    this.formSubmitted = true;

    const user = {
      username: this.username,
      password: this.password,
      name: this.name,
      surname: this.surname,
      role: this.role as Role,
    };

    if (form.valid) {
      form.reset();
      this.formSubmitted = false;

      this.subscriptions.push(this.userService.register(user)
      .subscribe(
        (token) => {
          // console.log('Login successo');
        },
        (error) => {
          // this.toastr.error
        }
      ));
    }
  }


}


