import { Injectable } from '@angular/core';
import { Environment } from 'src/environments/ienvironment';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentsService {

  constructor() { }

  getEnvironment(): Environment {
    return environment;
  }
}