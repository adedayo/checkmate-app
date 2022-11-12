import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAuthManualComponent } from './settings-auth-manual.component';

describe('SettingsAuthManualComponent', () => {
  let component: SettingsAuthManualComponent;
  let fixture: ComponentFixture<SettingsAuthManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsAuthManualComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsAuthManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
