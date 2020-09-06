import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { MobileMenuService } from 'src/app/services/mobile-menu/mobile-menu.service';

@Component({
  selector: 'app-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent implements OnInit {

  public isMobileTopbarOn = false;

  constructor(private mobileMenu: MobileMenuService, private renderer: Renderer2) { }

  ngOnInit() {
  }

  public toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.mobileMenu.toggleMenu();
  }

  public toggleMobileTopbar(event: MouseEvent) {
    event.stopPropagation();
    if (!this.isMobileTopbarOn) {
      this.renderer.addClass(document.body, 'kt-header__topbar--mobile-on');
      this.isMobileTopbarOn = !this.isMobileTopbarOn;
    }
  }

  @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
      if (this.isMobileTopbarOn) {
        this.renderer.removeClass(document.body, 'kt-header__topbar--mobile-on');
        this.isMobileTopbarOn = !this.isMobileTopbarOn;
      }
    }

}
