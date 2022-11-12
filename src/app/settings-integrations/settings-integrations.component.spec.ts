import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsIntegrationsComponent } from './settings-integrations.component';

describe('SettingsIntegrationsComponent', () => {
  let component: SettingsIntegrationsComponent;
  let fixture: ComponentFixture<SettingsIntegrationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsIntegrationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsIntegrationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
