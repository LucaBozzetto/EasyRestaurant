import { Injectable } from '@angular/core';
import { User, Role } from '@models/user.model';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private helper: JwtHelperService;

  constructor() {
    this.helper = new JwtHelperService();
  }

  public getToken(): string {
    const token = localStorage.getItem('user_token_easyrestaurant');
    return token;
  }

  public setToken(token: string): void {
    localStorage.setItem('user_token_easyrestaurant', token);
  }

  public removeToken(): void {
    // if (this.getToken) {
      localStorage.removeItem('user_token_easyrestaurant');
    // }
  }

  private decodeToken(token: string): any {
    try {
      const decodedToken = this.helper.decodeToken(token);
      return decodedToken;
    } catch (error) {
      console.log('Error decoding the token!');
      return null;
    }
  }

  public getUserFromToken(token: string): User {
    const decodedToken = this.decodeToken(token);

    if (decodedToken) {
      if ( !(Object.values(Role).includes(decodedToken.role))) {
        console.log('Error, the token has an invalid role!');
        return null;
      }

      const user = new User(
        decodedToken.username,
        decodedToken.name,
        decodedToken.surname,
        decodedToken.role,
        decodedToken.admin,
        decodedToken.hired,
        decodedToken._id
      );

      if (decodedToken.wage) {
        user.wage = decodedToken.wage;
      }

      return user;
    } else {
      return null;
    }
  }

  public isTokenExpired(token: string): boolean {
    return this.helper.isTokenExpired(token);
  }
}
