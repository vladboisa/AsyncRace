import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsButtonsComponent } from './cars-buttons.component';

describe('CarsButtonsComponent', () => {
  let component: CarsButtonsComponent;
  let fixture: ComponentFixture<CarsButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsButtonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarsButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
