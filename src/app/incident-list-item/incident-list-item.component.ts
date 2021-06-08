import { Component, Input } from '@angular/core';
import { SecurityDiagnostic } from '../models/project-scan';

@Component({
  selector: 'app-incident-list-item',
  templateUrl: './incident-list-item.component.html',
  styleUrls: ['./incident-list-item.component.scss']
})
export class IncidentListItemComponent {

  @Input() arrowIndex: string;
  @Input() issue: SecurityDiagnostic;

}
