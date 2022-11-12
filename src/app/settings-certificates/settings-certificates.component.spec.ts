import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCertificatesComponent } from './settings-certificates.component';

describe('SettingsCertificatesComponent', () => {
  let component: SettingsCertificatesComponent;
  let fixture: ComponentFixture<SettingsCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsCertificatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
