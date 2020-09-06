import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/models/user.model';
import { MobileMenuService } from '@services/mobile-menu/mobile-menu.service';

@Component({
  selector: 'app-user-bar',
  templateUrl: './user-bar.component.html',
  styleUrls: ['./user-bar.component.scss']
})
export class UserBarComponent implements OnInit {

  public showDropdown = false;
  public user: User;

  constructor(public userService: UserService, private mobileMenu: MobileMenuService) {
    this.user = this.userService.getUser();
  }

  ngOnInit() {
  }

  public openDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
    document.querySelector('body').style.cssText = '--index-test: 1';
  }

  @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
      if (this.showDropdown === true) {
        // console.log('called');
        this.showDropdown = false;
        document.querySelector('body').style.cssText = '--index-test: 97';
      }
    }

  public logout() {
    this.showDropdown = false;
    document.querySelector('body').style.cssText = '--index-test: 97';
    if (this.mobileMenu.isMenuOpened) {
      this.mobileMenu.toggleMenu();
    }
    this.userService.logout();
  }

}
