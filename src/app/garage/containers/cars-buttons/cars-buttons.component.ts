import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Car } from '../../../../models/api.models';
import { CarsService } from '../../../services/core/cars/cars.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-cars-buttons',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <section class="cars-buttons">
    <div class="cars-buttons-engine">
      <button mat-flat-button (click)="onPlayAllCars()">
        <mat-icon fontIcon="play_arrow"></mat-icon>
        Play
      </button>
      <button mat-flat-button (click)="onResetAllCars()">
        <mat-icon fontIcon="replay"></mat-icon>
        Reset
      </button>
    </div>
    <div class="cars-buttons-create">
      <form [formGroup]="createCarForm" (ngSubmit)="onSubmitCreateCar()">
        <input formControlName="name" required type="text" placeholder="Create car brand" />
        <input type="color" formControlName="color" />
        <button mat-flat-button type="submit" [disabled]="createCarForm.invalid">Create car</button>
      </form>
    </div>
    <div class="cars-buttons-update">
      <form [formGroup]="updateCarForm" (ngSubmit)="onSubmitUpdateCar()">
        <input formControlName="name" required type="text" placeholder="Update car brand" />
        <input type="color" formControlName="color" />
        <button mat-flat-button type="submit" [disabled]="!carId || updateCarForm.invalid">Update car</button>
      </form>
    </div>
    <div class="carsButtons-generate">
      <button mat-flat-button (click)="generateRandomCars()">Generate cars</button>
    </div>
  </section>`,
  styleUrl: './cars-buttons.component.scss',
})
export class CarsButtonsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly carsService = inject(CarsService);
  private readonly cdRef = inject(ChangeDetectorRef);

  @Input() carId: number | undefined;
  @Input() CURRENT_PAGE: number = 1;
  @Output() updateTotalCarsCount = new EventEmitter();
  @Output() startAllCars = new EventEmitter<void>();
  @Output() resetAllCars = new EventEmitter<void>();

  createCarForm: FormGroup;
  updateCarForm: FormGroup;
  constructor() {
    this.createCarForm = this.fb.group({
      name: ['', Validators.required],
      color: ['#000000'],
    });
    this.updateCarForm = this.fb.group({
      name: ['', Validators.required],
      color: ['#000000'],
    });
  }
  onSubmitCreateCar() {
    if (this.createCarForm.valid) {
      const newCar = this.createCarForm.value as Car;
      this.carsService.createCar(newCar, this.CURRENT_PAGE).subscribe(() => {
        this.updateTotalCarsCount.emit(this.carsService.totalCarsCount);
        this.cdRef.markForCheck();
      });
      this.createCarForm.get('name')?.reset();
    }
  }
  onSubmitUpdateCar() {
    if (this.updateCarForm.valid && this.carId) {
      const updatedCar = { ...this.updateCarForm.value, id: this.carId } as Car;
      this.carsService.updateCar(updatedCar).subscribe();
      this.createCarForm.get('name')?.reset();
    }
  }
  generateRandomCars() {
    this.carsService
      .createRandomCars()
      .pipe(
        switchMap(() => {
          this.updateTotalCarsCount.emit(this.carsService.totalCarsCount);
          return this.carsService.readAllCars(this.CURRENT_PAGE);
        })
      )
      .subscribe();
  }
  onPlayAllCars() {
    this.startAllCars.emit();
  }
  onResetAllCars() {
    this.resetAllCars.emit();
  }
}
