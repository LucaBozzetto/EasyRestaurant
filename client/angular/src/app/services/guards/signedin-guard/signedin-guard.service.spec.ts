/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SignedinGuardService } from './signedin-guard.service';

describe('Service: SignedinGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SignedinGuardService]
    });
  });

  it('should ...', inject([SignedinGuardService], (service: SignedinGuardService) => {
    expect(service).toBeTruthy();
  }));
});
