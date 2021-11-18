import { Pipe, PipeTransform } from '@angular/core';
import { GitLabProject } from '../models/gitlab-project';

@Pipe({
  name: 'gitlabSorter'
})
export class GitlabOrderPipe implements PipeTransform {

  transform(projects: GitLabProject[], ...args: string[]): GitLabProject[] {

    projects.sort((a, b) => {
      if (a.Group.Name < b.Group.Name) {
        return 1;
      } else if (a.Group.Name > b.Group.Name) {
        return -1;
      } else {
        if (a.NameWithNamespace < b.NameWithNamespace) {
          return -1;
        } else if (a.NameWithNamespace > b.NameWithNamespace) {
          return 1;
        } else {
          return 0;
        }
      }
    });

    return projects;
  }

}
