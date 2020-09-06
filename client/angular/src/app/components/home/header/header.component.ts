import { Component, OnInit, HostListener, Input} from '@angular/core';
import { MobileMenuService } from 'src/app/services/mobile-menu/mobile-menu.service';
import { TokenService } from '@services/token/token.service';
import { Role } from '@models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public opacity = 1;
  @Input() pages: any;

  constructor(private mobileMenu: MobileMenuService, private tokenService: TokenService) {}

  ngOnInit() {
  }

  public get isMenuOpened() {
    // console.log(this.mobileMenu.isMenuOpened);
    return this.mobileMenu.isMenuOpened;
  }

  @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent) {
      if (this.isMenuOpened === true) {
        // console.log('called');
        this.mobileMenu.toggleMenu();
        // document.querySelector('body').style.cssText = '--index-test: 97';
      }
    }

  public hasRole(role, ...multiples) {
    if (!Object.values(Role).includes(role)) {
      return false;
    }

    const token = this.tokenService.getToken();
    if (!token) {
      // console.log('Error, how come you called this while not being logged in?');
      return false;
    }

    const user = this.tokenService.getUserFromToken(token);
    if (!user) {
      // console.log('Error, how come you called this while not being logged in?');
      return false;
    }

    if (multiples && multiples.length > 0 && multiples.includes(user.role)) {
      return true;
    }

    return user.role === role;

  }

}
