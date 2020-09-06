import {Injectable, HostListener} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MobileMenuService {

  private menuOpened: boolean;

  constructor() {
    this.menuOpened = false;
  }

  public get isMenuOpened() {
    return this.menuOpened;
  }

  public toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }
}
