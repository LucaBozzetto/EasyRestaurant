/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BillComponent } from './bill.component';

describe('BillComponent', () => {
  let component: BillComponent;
  let fixture: ComponentFixture<BillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
