import { Component, OnInit } from '@angular/core';
import { faGithub, faGitlab } from '@fortawesome/free-brands-svg-icons';
import { CheckMateService } from '../services/checkmate.service';


@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {

  faGithub = faGithub;
  faGitlab = faGitlab;
  gitLabEnabled = false;
  gitHubEnabled = false;
  gitServiceEnabled = false;
  gitLabClass = 'cursor-default';
  gitHubClass = 'cursor-default';
  ghContentClass = 'hidden';
  glContentClass = 'hidden';
  constructor(private checkMate: CheckMateService) { }

  ngOnInit(): void {
    this.checkMate.gitCapabilities.subscribe(cap => {
      if (cap.GitLabEnabled) {
        this.gitLabClass = 'cursor-pointer';
        this.gitLabEnabled = true;
        this.gitServiceEnabled = true;
        this.clickTab('gitlab');
      }
      if (cap.GitHubEnabled) {
        this.gitHubClass = 'cursor-pointer';
        this.gitHubEnabled = true;
        this.gitServiceEnabled = true;
        this.clickTab('github');
      }
    });


  }


  clickTab(tab: string) {
    switch (tab) {
      case 'github':
        this.ghContentClass = '';
        this.gitHubClass =
          'w-40 cursor-pointer bg-purple-100 -mb-px px-2' +
          ' py-2 text-gray-600 rounded-t opacity-100 font-semibold border-b-2 border-purple-400';
        this.glContentClass = 'hidden';
        this.gitLabClass = 'w-40 cursor-pointer bg-purple-100 ' +
          '-mb-px px-2 py-2 text-gray-600 rounded-t opacity-50';

        break;
      case 'gitlab':
        this.ghContentClass = 'hidden';
        this.gitHubClass = 'w-40 cursor-pointer bg-purple-100 -mb-px px-2 py-2 text-gray-600 rounded-t opacity-50';
        this.glContentClass = '';
        this.gitLabClass = 'w-40 cursor-pointer bg-purple-100 -mb-px ' +
          'px-2 py-2 text-gray-600 rounded-t opacity-100 font-semibold border-b-2 border-purple-400';

        break;
      default:
        break;
    }
  }

}
