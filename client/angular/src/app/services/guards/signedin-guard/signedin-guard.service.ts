import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '@services/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class SignedinGuardService implements CanActivate {

  constructor(private router: Router, private tokenService: TokenService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const token = this.tokenService.getToken();

    if (token && !this.tokenService.isTokenExpired(token)) {
      return true;
    } else {
      this.router.navigateByUrl('auth');
      return false;
    }
  }

}
