import { Pipe, PipeTransform } from '@angular/core';
import { GitHubProject } from '../models/github-project';

@Pipe({
  name: 'githubFilter'
})
export class GithubFilterPipe implements PipeTransform {

  transform(projects: GitHubProject[], ...args: string[]): GitHubProject[] {
    const filter = args[0].toLowerCase();
    if (projects && filter !== '') {
      const projs = projects.filter((x) => `${x.Name}${x.Url}`.
        toLowerCase().includes(filter));
      return projs;
    }
    return projects;
  }

}
