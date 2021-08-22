import { Pipe, PipeTransform } from '@angular/core';
import { ProjectSummary } from '../models/project-scan';

@Pipe({
  name: 'projectFilter'
})

export class ProjectNameFilterPipe implements PipeTransform {
  transform(projects: ProjectSummary[], ...args: string[]): ProjectSummary[] {
    const filter = args[0].toLowerCase();
    if (projects && filter !== '') {
      return projects.filter((p) => !p.Name || p.Name.toLowerCase().includes(filter));
    }
    return projects;
  }
}
