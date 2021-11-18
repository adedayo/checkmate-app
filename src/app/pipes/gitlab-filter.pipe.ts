/* eslint-disable @typescript-eslint/naming-convention */
import { Pipe, PipeTransform } from '@angular/core';
import { stringify } from 'querystring';
import { GitLabGroupedProjects, GitLabProject } from '../models/gitlab-project';

@Pipe({
  name: 'gitlabFilter'
})
export class GitlabFilterPipe implements PipeTransform {

  transform(projects: GitLabProject[], ...args: string[]): GitLabGroupedProjects[] {

    const filter = args[0].toLowerCase();
    if (projects && filter !== '') {
      const projs = this.groupProjects(projects.filter((x) => `${x.NameWithNamespace}${x.Group.Name}
      ${x.Description}${x.Group.Description}`.toLowerCase().includes(filter)));
      return projs;
    }
    return this.groupProjects(projects);
  }


  groupProjects(projects: GitLabProject[]): GitLabGroupedProjects[] {
    let out: Map<string, GitLabGroupedProjects> = new Map();
    let count = 0;
    projects.forEach(p => {
      const gid = p.Group.ID;
      if (out.has(gid)) {
        const group = out.get(gid);
        group.Projects = group.Projects.concat(p);
      } else if (gid) {
        out = out.set(gid, {
          ID: gid,
          Name: p.Group.Name,
          Projects: [p],
        });
      } else {
        count += 1;
        out = out.set(`__checkmate__${count}`, {
          ID: gid,
          Name: p.Group.Name,
          Projects: [p],
        });
      }
    });

    let result: GitLabGroupedProjects[] = [];
    out.forEach(x => {
      result = result.concat(x);
    });
    return result;
  }

}
