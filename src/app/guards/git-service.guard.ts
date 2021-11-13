import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CheckMateService } from '../services/checkmate.service';

@Injectable({
  providedIn: 'root'
})
export class GitServiceGuard implements CanActivate {

  gitServiceEnabled = false;

  constructor(private checkMate: CheckMateService) {
    this.checkMate.gitCapabilities.subscribe(cap => {
      console.log(cap);
      this.gitServiceEnabled = cap.GitServiceEnabled
    })
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.gitServiceEnabled;
  }

}
