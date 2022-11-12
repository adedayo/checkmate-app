import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAuthIdpComponent } from './settings-auth-idp.component';

describe('SettingsAuthIdpComponent', () => {
  let component: SettingsAuthIdpComponent;
  let fixture: ComponentFixture<SettingsAuthIdpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsAuthIdpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsAuthIdpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
