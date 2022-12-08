import { Component, Input, OnInit } from '@angular/core';
import { Group, LDAPRecords } from '../models/ldap';

@Component({
  selector: 'app-ldap-view',
  templateUrl: './ldap-view.component.html',
  styleUrls: ['./ldap-view.component.scss']
})
export class LdapViewComponent implements OnInit {

  @Input() ldapRecords: LDAPRecords;

  currentGroup: Group;
  constructor() { }

  ngOnInit(): void { }


  setGroup(index: number) {
    if (this.ldapRecords && this.ldapRecords.usersAndGroups &&
      this.ldapRecords.usersAndGroups.groups && this.ldapRecords.usersAndGroups.groups.length > index) {
      this.currentGroup = this.ldapRecords.usersAndGroups.groups[index];
    } else {
      this.currentGroup = null;
    }
  }


}
