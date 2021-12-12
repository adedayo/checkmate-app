/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { GitService } from '../models/git';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-github-settings',
  templateUrl: './github-settings.component.html',
  styleUrls: ['./github-settings.component.scss']
})
export class GithubSettingsComponent implements OnInit {

  faTrash = faTrashAlt;

  showInstruction = false;
  connectForm: FormGroup;
  gitHubConnections: GitService[];
  accountTypes = ['User', 'Organization'];

  constructor(private fb: FormBuilder, private checkmateService: CheckMateService) { }

  ngOnInit(): void {
    this.connectForm = this.fb.group({
      accountName: ['', Validators.required],
      accountType: ['User'],
      accessToken: ['', Validators.required],
      apiKeyName: ['', Validators.required],
    });

    this.checkmateService.getGitHubIntegrations().subscribe(data => this.gitHubConnections = data);
  }


  createIntegration() {
    const account = this.connectForm.get('accountName').value as string;
    const accountType = this.connectForm.get('accountType').value as string;
    const endpoint = 'https://github.com/' + account;
    const apiKey = this.connectForm.get('accessToken').value as string;
    const apiKeyName = this.connectForm.get('apiKeyName').value as string;

    const integration: GitService = {
      API_Key: apiKey,
      InstanceURL: endpoint,
      Name: apiKeyName,
      AccountName: account,
      AccountType: accountType,
    };

    console.log(integration);


    this.checkmateService.createGitHubIntegration(integration).subscribe(data => {
      this.gitHubConnections = data;
    });

  }

  deleteBinding(id: string) {
    this.checkmateService.deleteGitHubIntegration(id).subscribe(data => {
      this.gitHubConnections = data;
    });
  }
}
