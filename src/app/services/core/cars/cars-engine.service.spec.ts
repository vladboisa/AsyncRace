import { TestBed } from '@angular/core/testing';

import { CarsEngineService } from './cars-engine.service';

describe('CarsEngineService', () => {
  let service: CarsEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarsEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
