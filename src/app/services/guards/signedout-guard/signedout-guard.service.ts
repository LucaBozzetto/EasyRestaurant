import { Injectable } from '@angular/core';
import { TokenService } from '@services/token/token.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SignedoutGuardService {

  constructor(private tokenService: TokenService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const token = this.tokenService.getToken();

    if (!token) {
      return true;
    } else {
      this.router.navigateByUrl('menu');
      return false;
    }
  }

}
