import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LDAPConfigForm, LDAPFilter } from '../models/ldap';

@Component({
  selector: 'app-settings-auth-ldap',
  templateUrl: './settings-auth-ldap.component.html',
  styleUrls: ['./settings-auth-ldap.component.scss']
})
export class SettingsAuthLdapComponent implements OnInit {

  ldapForm: FormGroup = null;
  authForm: FormGroup;
  showTestAuthForm = false;
  colapseUserRules = true;
  colapseGroupRules = true;
  colapseMembershipRules = true;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {

    this.ldapForm = this.fb.group({
      ldapServer: ['', [Validators.required]],
      ldapPort: ['389', [Validators.required]],
      uid: ['uid', [Validators.required]],
      urdns: ['', [Validators.required]],
      syncRequiresAuth: [false],
      syncUserName: [''],
      syncPassword: [''],
      tls: this.fb.group({
        option: ['tls', [Validators.required]]//other options: tls or starttls
      }),
      baseDNs: this.fb.array([]),
      userFilter: null,
      groupFilter: null,
      groupMembershipFilter: null,
    }, { validators: [this.validateForm] });

    this.authForm = this.fb.group({
      username: ['', [Validators.required]],
      pwd: ['', [Validators.required]],
    });

    this.addBaseDN();
  }

  addBaseDN() {
    const dn = this.fb.group({
      baseDN: ['', Validators.required]
    });
    this.baseDNs.push(dn);
  }


  validateForm(c: FormControl) {
    if (!c) {
      return c;
    }

    if (validate(c.get('userFilter'))) {
      return {
        invalid: true
      };
    }

    if (validate(c.get('groupFilter'))) {
      return {
        invalid: true
      };
    }

    if (validate(c.get('groupMembershipFilter'))) {
      return {
        invalid: true
      };
    }
    return null;
  }

  public get baseDNs(): FormArray {
    return this.ldapForm.get('baseDNs') as FormArray;
  }

  public get tls(): FormGroup {
    return this.ldapForm.get('tls') as FormGroup;
  }


  public get syncRequiresAuth(): boolean {
    return this.ldapForm.get('syncRequiresAuth').value as boolean;
  }

  public get serverFormValid(): boolean {
    return this.ldapForm.get('ldapServer').valid && this.ldapForm.get('ldapPort').valid &&
      this.ldapForm.get('uid').valid && this.ldapForm.get('urdns').valid && this.ldapForm.get('tls').valid;
  }

  public get syncFormValid(): boolean {
    return this.serverFormValid && this.ldapForm.get('baseDNs').valid &&
      this.ldapForm.get('userFilter').valid && this.ldapForm.get('groupFilter').valid;
  }

  authUser() {
    console.log(this.ldapForm.value);
  }

  public get ldapConfigForm(): LDAPConfigForm {
    return {
      server: this.ldapForm.get('ldapServer').value as string,
      port: this.ldapForm.get('ldapPort').value as string,
      urdns: this.ldapForm.get('urdns').value as string,
      uid: this.ldapForm.get('uid').value as string,
      tls: this.ldapForm.get('tls').value.option as string,
      user: this.authForm.get('username').value as string,
      pwd: this.authForm.get('pwd').value as string
    };
  }

  deleteBaseDN(i: number) {
    this.baseDNs.removeAt(i);
  }

  configureLDAP(event) {

    console.log(this.ldapForm.value);


  }

  makeLDAPFilter(): LDAPFilter {
    const filter: LDAPFilter = {
      operator: 0,
      filters: [{
        name: '',
        value: '',
      },
      ],
      filterGroups: [],
    };
    return filter;
  }
}


const valid = (ld: LDAPFilter): boolean => {
  if (!ld) {
    return true;
  }

  let inv = false;
  if (ld.filters) {
    ld.filters.forEach(exp => {
      if (exp.name === '' || exp.value === '') {
        inv = true;
      }
    });
    if (inv) {
      return false;
    }
  }
  inv = true;

  if (ld.filterGroups) {
    ld.filterGroups.forEach(g => {
      inv = inv && valid(g);
    });
  }
  return inv;
};

const validate = (c: AbstractControl) => {
  if (c) {
    const ld = c.value as LDAPFilter;
    if (!valid(ld)) {
      return {
        invalid: true
      };
    }
  };
  return null;
};

