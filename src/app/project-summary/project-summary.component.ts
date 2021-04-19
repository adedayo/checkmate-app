import { Component, Input, OnInit } from '@angular/core';
import { faCog, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { ProjectSummary, ProjectScanOptions, ScanEnd, ScanProgress, ScanResult } from '../models/project-scan';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss']
})
export class ProjectSummaryComponent implements OnInit {

  @Input() projectSummary: ProjectSummary;
  faCog = faCog;
  faPlayCircle = faPlayCircle;
  currentFile = '';
  progress = 0;
  scanning = false;

  multi = [
    {
      name: 'Germany',
      series: [
        {
          name: '1990',
          value: 62000000
        },
        {
          name: '2010',
          value: 73000000
        },
        {
          name: '2011',
          value: 89400000
        }
      ]
    },

    {
      name: 'USA',
      series: [
        {
          name: '1990',
          value: 250000000
        },
        {
          name: '2010',
          value: 309000000
        },
        {
          name: '2011',
          value: 311000000
        }
      ]
    },

    {
      name: 'France',
      series: [
        {
          name: '1990',
          value: 58000000
        },
        {
          name: '2010',
          value: 50000020
        },
        {
          name: '2011',
          value: 58000000
        }
      ]
    },
    {
      name: 'UK',
      series: [
        {
          name: '1990',
          value: 57000000
        },
        {
          name: '2010',
          value: 62000000
        }
      ]
    }
  ];
  view: any[] = [350, 120];

  // options
  legend = false;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = false;
  showXAxisLabel = false;
  xAxisLabel = 'Time';
  yAxisLabel = 'Grade';
  timeline = false;
  autoScale = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };


  constructor(private checkMateService: CheckMateService) { }

  ngOnInit(): void {

  }

  displayType(t: string): string {
    if (t === 'filesystem') {
      return 'fs';
    }
    return t;
  }

  runScan() {
    this.scanning = true;
    const options: ProjectScanOptions = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ProjectID: this.projectSummary.ID,
    };
    this.checkMateService.runScan(options).subscribe(
      msg => {

        if (this.isScanProgress(msg)) {
          console.log('Got progress: ', JSON.stringify(msg));
          const prog = msg as ScanProgress;
          this.currentFile = prog.CurrentFile;
          if (prog.Total > 0) {
            this.progress = (100 * prog.Position) / prog.Total;
          }
        } else if (this.isScanEnd(msg)) {
          console.log('Ending scan');
          this.currentFile = '';
          this.scanning = false;
          this.checkMateService.getProjectSummary(this.projectSummary.ID).subscribe(summary => {
            this.projectSummary = summary;
          });
        }
      },
      err => {
        console.log('Error', err);
      },
      () => {
        console.log('Socket closed');
      }
    );


  }

  isScanProgress(msg: ScanResult | ScanProgress | ScanEnd | ProjectScanOptions): boolean {
    return (msg as ScanProgress).Position !== undefined;
  }

  isScanEnd(msg: ScanResult | ScanProgress | ScanEnd | ProjectScanOptions): boolean {
    return (msg as ScanEnd).Message !== undefined;
  }
}
