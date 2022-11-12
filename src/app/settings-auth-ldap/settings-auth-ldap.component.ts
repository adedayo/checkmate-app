import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings-auth-ldap',
  templateUrl: './settings-auth-ldap.component.html',
  styleUrls: ['./settings-auth-ldap.component.scss']
})
export class SettingsAuthLdapComponent implements OnInit {

  ldapForm: FormGroup;
  authForm: FormGroup;
  showTestAuthForm = false;
  constructor(private fb: FormBuilder) {

    this.ldapForm = this.fb.group({
      ldapServer: ['', [Validators.required]],
      ldapPort: ['389', [Validators.required]],
      uid: ['uid', [Validators.required]],
      urdns: ['', [Validators.required]],
      tls: this.fb.group({
        option: ['tls', [Validators.required]]//other options: tls or starttls
      })
    });

    this.authForm = this.fb.group({
      username: ['', [Validators.required]],
      pwd: ['', [Validators.required]],
    });

  }

  ngOnInit(): void {
  }


  public get tls(): FormGroup {
    // console.log(this.ldapForm.get('tls'));

    return this.ldapForm.get('tls') as FormGroup;
  }


  configureLDAP(event) { }
}
