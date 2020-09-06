import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '@services/token/token.service';
import { ToastrService } from 'ngx-toastr';
import { Role } from '@models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(private router: Router, private tokenService: TokenService, private toastr: ToastrService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const requiredRoles: Role[] = route.data.requiredRoles;

    const token = this.tokenService.getToken();

    if (token && !this.tokenService.isTokenExpired(token)) {
      const user = this.tokenService.getUserFromToken(token);

      if (user && requiredRoles.includes(user.role)) {
        return true;
      } else {
        this.toastr.error(`Only ${requiredRoles} can access this page`, 'Unauthorized!');
        this.router.navigateByUrl('/');
      }
    } else {
      this.toastr.error(`Only ${requiredRoles} can access this page`, 'Unauthorized!');
      this.router.navigateByUrl('/');
      return false;
    }
  }

}
