import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit {

  private classes = {
    'kt-login--signin' : true,
    'kt-login--signup': false,
    'kt-login--forgot': false,
  };

  constructor() { }

  ngOnInit() {
  }

  public getClass() {
    return this.classes;
  }

  public isLoginActive() {
    return this.classes['kt-login--signin'];
  }

  public isRegistrationActive() {
    return this.classes['kt-login--signup'];
  }

  public isForgotActive() {
    return this.classes['kt-login--forgot'];
  }

  public setLoginActive() {
    this.classes['kt-login--forgot'] = false;
    this.classes['kt-login--signup'] = false;
    this.classes['kt-login--signin'] = true;
  }

  public setRegistrationActive() {
    this.classes['kt-login--forgot'] = false;
    this.classes['kt-login--signup'] = true;
    this.classes['kt-login--signin'] = false;
  }

  public setForgotActive() {
    this.classes['kt-login--forgot'] = true;
    this.classes['kt-login--signup'] = false;
    this.classes['kt-login--signin'] = false;
  }

}
