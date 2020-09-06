import { Component, OnInit, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss']
})
export class ForgotComponent implements OnInit {

  constructor(private viewContainerRef: ViewContainerRef) { }

  ngOnInit() {
  }

  getParentComponent() {
    return this.viewContainerRef['_data'].componentView.component.viewContainerRef['_view'].component;
  }

  public setLoginActive(){
    this.getParentComponent().setLoginActive();
  }

}
