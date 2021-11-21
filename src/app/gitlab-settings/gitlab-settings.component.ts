import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faInfo, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-gitlab-settings',
  templateUrl: './gitlab-settings.component.html',
  styleUrls: ['./gitlab-settings.component.scss']
})
export class GitlabSettingsComponent implements OnInit {

  showInstruction = false;
  faInfo = faInfoCircle;
  connectForm: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.connectForm = this.fb.group({
      instanceName: ['', Validators.required],
      accessToken: ['', Validators.required],
    });

  }

  createIntegration() {

  }
}
