import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAuthLdapComponent } from './settings-auth-ldap.component';

describe('SettingsAuthLdapComponent', () => {
  let component: SettingsAuthLdapComponent;
  let fixture: ComponentFixture<SettingsAuthLdapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsAuthLdapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsAuthLdapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
