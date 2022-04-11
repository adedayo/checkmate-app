/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { Subscription } from 'rxjs';
import { GitService } from '../models/git';
import { CheckMateService } from '../services/checkmate.service';

@Component({
  selector: 'app-gitlab-settings',
  templateUrl: './gitlab-settings.component.html',
  styleUrls: ['./gitlab-settings.component.scss']
})
export class GitlabSettingsComponent implements OnInit, OnDestroy {

  showInstruction = false;
  faTrash = faTrashAlt;
  connectForm: FormGroup;
  gitLabConnections: GitService[];
  subscriptions: Subscription;
  constructor(private fb: FormBuilder, private checkmateService: CheckMateService) { }


  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.connectForm = this.fb.group({
      instanceURL: ['', Validators.required],
      accessToken: ['', Validators.required],
      apiKeyName: ['', Validators.required],
    });
    this.subscriptions = this.checkmateService.getGitLabIntegrations().subscribe(data => this.gitLabConnections = data);
  }

  createIntegration() {
    const endpoint = this.connectForm.get('instanceURL').value as string;
    const apiKey = this.connectForm.get('accessToken').value as string;
    const apiKeyName = this.connectForm.get('apiKeyName').value as string;

    const integration: GitService = {
      API_Key: apiKey,
      InstanceURL: endpoint,
      Name: apiKeyName,
    };

    this.subscriptions.add(this.checkmateService.createGitLabIntegration(integration).subscribe(data => {
      this.gitLabConnections = data;
    }));

  }

  deleteBinding(id: string) {
    this.subscriptions.add(this.checkmateService.deleteGitLabIntegration(id).subscribe(data => {
      this.gitLabConnections = data;
    }));
  }
}
