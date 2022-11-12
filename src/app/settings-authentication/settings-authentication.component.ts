import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-settings-authentication',
  templateUrl: './settings-authentication.component.html',
  styleUrls: ['./settings-authentication.component.scss']
})
export class SettingsAuthenticationComponent implements OnInit, AfterViewInit {

  @ViewChild('ldap') ldapTab: ElementRef

  defaultTabStyle = `nav-link
      w-full
      block
      font-medium
      text-xs
      text-gray-800
      leading-tight
      border-x-0 border-t-0 border-b-2 border-transparent
      px-6
      py-3
      my-2
      hover:border-transparent hover:bg-purple-50
      active`
  selectedTabStyle = this.defaultTabStyle + `
      border-b-purple-700
      bg-purple-100
      `

  ldapTabStyle = this.selectedTabStyle
  idpTabStyle = this.defaultTabStyle
  manualTabStyle = this.defaultTabStyle

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.ldapTab.nativeElement.click()
  }

  clickTab(tab: string) {
    switch (tab) {
      case 'ldap':
        this.ldapTabStyle = this.selectedTabStyle
        this.idpTabStyle = this.defaultTabStyle
        this.manualTabStyle = this.defaultTabStyle
        break;

      case 'idp':
        this.ldapTabStyle = this.defaultTabStyle
        this.idpTabStyle = this.selectedTabStyle
        this.manualTabStyle = this.defaultTabStyle
        break;

      case 'manual':
        this.ldapTabStyle = this.defaultTabStyle
        this.idpTabStyle = this.defaultTabStyle
        this.manualTabStyle = this.selectedTabStyle
        break;


      default:
        this.ldapTabStyle = this.selectedTabStyle
        this.idpTabStyle = this.defaultTabStyle
        this.manualTabStyle = this.defaultTabStyle
        break;
    }
  }

}
