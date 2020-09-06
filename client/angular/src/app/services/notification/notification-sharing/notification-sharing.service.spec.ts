/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NotificationSharingService } from './notification-sharing.service';

describe('Service: NotificationSharing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationSharingService]
    });
  });

  it('should ...', inject([NotificationSharingService], (service: NotificationSharingService) => {
    expect(service).toBeTruthy();
  }));
});
