import { Component, OnInit, ViewContainerRef, OnDestroy } from '@angular/core';
import { UserService } from '@services/user/user.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SocketService } from '@services/socket/socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  public username: string;
  public password: string;
  public formSubmitted = false;
  public subscriptions: Subscription[];

  constructor(public viewContainerRef: ViewContainerRef, public userService: UserService) {
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

  public setForgotActive() {
    this.getParentComponent().setForgotActive();
  }

  public login(form: NgForm) {
    this.formSubmitted = true;

    const user = {
      username: this.username,
      password: this.password,
    };

    if (form.valid) {
      form.reset();
      this.formSubmitted = false;

      this.subscriptions.push(this.userService.login(user)
      .subscribe(
        (token) => // console.log('Login successo'),
        (error) => {
          // this.toastr.error
        }
      ));
    }
  }

}
