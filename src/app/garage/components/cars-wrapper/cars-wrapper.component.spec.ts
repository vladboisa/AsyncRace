import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsWrapperComponent } from './cars-wrapper.component';

describe('CarsWrapperComponent', () => {
  let component: CarsWrapperComponent;
  let fixture: ComponentFixture<CarsWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsWrapperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarsWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
