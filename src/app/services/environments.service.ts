import { Injectable } from '@angular/core';
import { Environment } from 'src/environments/ienvironment';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../models/app-config';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentsService {

  static config: AppConfig;

  constructor(private http: HttpClient) { }

  getEnvironment(): Environment {
    if (EnvironmentsService.config) {
      environment.apiHost = EnvironmentsService.config.apiHost;
      return environment;
    }
    return environment;
  }

  load() {
    const configFile = `assets/app_config.json`;
    return new Promise<void>((resolve, reject) => {
      this.http.get(configFile).toPromise().then((response: AppConfig) => {
        EnvironmentsService.config = response;
        resolve();
      }).catch((response) => {
        reject(`Could not load file '${configFile}': ${JSON.stringify(response)}`);
      });
    });
  }
}
