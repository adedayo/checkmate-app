import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxIsElectronComponent } from './ngx-is-electron.component';

describe('NgxIsElectronComponent', () => {
  let component: NgxIsElectronComponent;
  let fixture: ComponentFixture<NgxIsElectronComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxIsElectronComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxIsElectronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
