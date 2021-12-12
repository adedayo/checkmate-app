/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProjectSubForm } from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectFormsService {

  private projectsDetail = new BehaviorSubject<Map<string, ProjectSubForm>>(new Map());
  constructor() { }

  get projectsDetailState(): Observable<Map<string, ProjectSubForm>> {
    return this.projectsDetail.asObservable();
  }

  public updateProjectForm(v: ProjectSubForm) {
    const map = this.projectsDetail.getValue();
    map.set(v.GroupID, {
      GroupID: v.GroupID,
      Projects: v.Projects,
    });
    this.projectsDetail.next(map);
  }

  public clearProjectForm() {
    this.projectsDetail.next(new Map());
  }
}
