import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public router: Router){

  }
  canActivate(

    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    
      const isLoggedIn = localStorage.getItem('isLoggedIn'); 
      
      if(isLoggedIn == 'LogIn'){

        return true;

      }else{
        this.router.navigate(['/login']);
        return false;
      }

      
  }
}
