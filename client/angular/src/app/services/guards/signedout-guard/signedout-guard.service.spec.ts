/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SignedoutGuardService } from './signedout-guard.service';

describe('Service: SignedoutGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SignedoutGuardService]
    });
  });

  it('should ...', inject([SignedoutGuardService], (service: SignedoutGuardService) => {
    expect(service).toBeTruthy();
  }));
});
