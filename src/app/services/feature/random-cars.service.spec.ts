import { TestBed } from '@angular/core/testing';

import { RandomCarsService } from './random-cars.service';

describe('RandomCarsService', () => {
  let service: RandomCarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomCarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
