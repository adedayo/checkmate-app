import { Component, OnInit } from '@angular/core';
import { faGithub, faGitlab } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  faGithub = faGithub;
  faGitlab = faGitlab;
  gitLabEnabled = false;
  gitHubEnabled = false;
  gitLabClass = 'cursor-default';
  gitHubClass = 'cursor-default';
  ghContentClass = 'hidden';
  glContentClass = 'hidden';

  constructor() { }

  ngOnInit(): void {

    this.clickTab('github');
    this.clickTab('gitlab');


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
