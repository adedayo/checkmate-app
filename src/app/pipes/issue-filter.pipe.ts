import { Pipe, PipeTransform } from '@angular/core';
import { SecurityDiagnostic } from '../models/project-scan';

@Pipe({
  name: 'issueFilter'
})

export class IssueFilterPipe implements PipeTransform {
  transform(issues: SecurityDiagnostic[], ...args: string[]): SecurityDiagnostic[] {
    const filter = args[0].toLowerCase();
    if (issues && filter !== '') {
      return issues.filter((x) => JSON.stringify(x).toLowerCase().includes(filter));
    }
    return issues;
  }
}
