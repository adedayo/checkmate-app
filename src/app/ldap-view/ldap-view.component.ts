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

  ngOnInit(): void {
    this.ldapRecords = {
      entries: [
        {
          dn: 'dc=example,dc=org',
          attributes: [
            {
              name: 'objectClass',
              values: [
                'top',
                'dcObject',
                'organization'
              ]
            },
            {
              name: 'o',
              values: [
                'Example Inc.'
              ]
            },
            {
              name: 'dc',
              values: [
                'example'
              ]
            }
          ]
        },
        {
          dn: 'cn=admins,dc=example,dc=org',
          attributes: [
            {
              name: 'cn',
              values: [
                'admins'
              ]
            },
            {
              name: 'gidNumber',
              values: [
                '500'
              ]
            },
            {
              name: 'objectClass',
              values: [
                'posixGroup',
                'top'
              ]
            },
            {
              name: 'memberUid',
              values: [
                'User1 First'
              ]
            }
          ]
        },
        {
          dn: 'cn=developers,dc=example,dc=org',
          attributes: [
            {
              name: 'cn',
              values: [
                'developers'
              ]
            },
            {
              name: 'gidNumber',
              values: [
                '501'
              ]
            },
            {
              name: 'objectClass',
              values: [
                'posixGroup',
                'top'
              ]
            },
            {
              name: 'memberUid',
              values: [
                'User2 Second',
                'User3 Third',
                'User1 First'
              ]
            }
          ]
        },
        {
          dn: 'cn=users,dc=example,dc=org',
          attributes: [
            {
              name: 'cn',
              values: [
                'users'
              ]
            },
            {
              name: 'gidNumber',
              values: [
                '502'
              ]
            },
            {
              name: 'objectClass',
              values: [
                'posixGroup',
                'top'
              ]
            }
          ]
        },
        {
          dn: 'cn=User1 First,cn=users,dc=example,dc=org',
          attributes: [
            {
              name: 'givenName',
              values: [
                'User1'
              ]
            },
            {
              name: 'sn',
              values: [
                'First'
              ]
            },
            {
              name: 'cn',
              values: [
                'User1 First'
              ]
            },
            {
              name: 'uid',
              values: [
                'ufirst'
              ]
            },
            {
              name: 'uidNumber',
              values: [
                '1000'
              ]
            },
            {
              name: 'gidNumber',
              values: [
                '500'
              ]
            },
            {
              name: 'homeDirectory',
              values: [
                '/home/users/ufirst'
              ]
            },
            {
              name: 'loginShell',
              values: [
                '/bin/bash'
              ]
            },
            {
              name: 'objectClass',
              values: [
                'inetOrgPerson',
                'posixAccount',
                'top'
              ]
            }
          ]
        },
        {
          dn: 'cn=User2 Second,cn=users,dc=example,dc=org',
          attributes: [
            {
              name: 'givenName',
              values: [
                'User2'
              ]
            },
            {
              name: 'sn',
              values: [
                'Second'
              ]
            },
            {
              name: 'cn',
              values: [
                'User2 Second'
              ]
            },
            {
              name: 'uid',
              values: [
                'usecond'
              ]
            },
            {
              name: 'uidNumber',
              values: [
                '1001'
              ]
            },
            {
              name: 'gidNumber',
              values: [
                '501'
              ]
            },
            {
              name: 'homeDirectory',
              values: [
                '/home/users/usecond'
              ]
            },
            {
              name: 'loginShell',
              values: [
                '/bin/bash'
              ]
            },
            {
              name: 'objectClass',
              values: [
                'inetOrgPerson',
                'posixAccount',
                'top'
              ]
            }
          ]
        },
        {
          dn: 'cn=User3 Third,cn=users,dc=example,dc=org',
          attributes: [
            {
              name: 'givenName',
              values: [
                'User3'
              ]
            },
            {
              name: 'sn',
              values: [
                'Third'
              ]
            },
            {
              name: 'uid',
              values: [
                'uthird'
              ]
            },
            {
              name: 'uidNumber',
              values: [
                '1002'
              ]
            },
            {
              name: 'gidNumber',
              values: [
                '501'
              ]
            },
            {
              name: 'homeDirectory',
              values: [
                '/home/users/uthird'
              ]
            },
            {
              name: 'loginShell',
              values: [
                '/bin/sh'
              ]
            },
            {
              name: 'objectClass',
              values: [
                'inetOrgPerson',
                'posixAccount',
                'top'
              ]
            },
            {
              name: 'cn',
              values: [
                'User3 Third'
              ]
            }
          ]
        }
      ],
      usersAndGroups: {
        users: [
          {
            id: 'User1 First',
            dn: 'cn=User1 First,cn=users,dc=example,dc=org'
          },
          {
            id: 'User2 Second',
            dn: 'cn=User2 Second,cn=users,dc=example,dc=org'
          },
          {
            id: 'User3 Third',
            dn: 'cn=User3 Third,cn=users,dc=example,dc=org'
          }
        ],
        groups: [
          {
            id: 'admins',
            dn: 'cn=admins,dc=example,dc=org',
            members: [
              'cn=User1 First,cn=users,dc=example,dc=org'
            ]
          },
          {
            id: 'developers',
            dn: 'cn=developers,dc=example,dc=org',
            members: [
              'cn=User1 First,cn=users,dc=example,dc=org',
              'cn=User2 Second,cn=users,dc=example,dc=org',
              'cn=User3 Third,cn=users,dc=example,dc=org'
            ]
          },
          {
            id: 'users',
            dn: 'cn=users,dc=example,dc=org',
            members: null
          }
        ]
      }
    };
  }


  setGroup(index: number) {
    if (this.ldapRecords && this.ldapRecords.usersAndGroups &&
      this.ldapRecords.usersAndGroups.groups && this.ldapRecords.usersAndGroups.groups.length > index) {
      this.currentGroup = this.ldapRecords.usersAndGroups.groups[index];
    } else {
      this.currentGroup = null;
    }
  }


}
