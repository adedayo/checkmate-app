import { TestBed } from '@angular/core/testing';

import { NgxIsElectronService } from './ngx-is-electron.service';

describe('NgxIsElectronService', () => {
  let service: NgxIsElectronService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxIsElectronService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
