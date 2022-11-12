import { TestBed } from '@angular/core/testing';

import { SelfSignedInterceptor } from './self-signed.interceptor';

describe('SelfSignedInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SelfSignedInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: SelfSignedInterceptor = TestBed.inject(SelfSignedInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
