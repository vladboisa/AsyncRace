import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
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
  changeDetection: ChangeDetectionStrategy.Default,
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
        <input type="color" (change)="onCreateColorChange($event)" />
        <button mat-flat-button type="submit" [disabled]="createCarForm.invalid">Create car</button>
      </form>
    </div>
    <div class="cars-buttons-update">
      <form [formGroup]="updateCarForm" (ngSubmit)="onSubmitUpdateCar()">
        <input formControlName="name" type="text" placeholder="Update car brand" />
        <input type="color" [value]="singleCar?.color" (change)="onUpdateColorChange($event)" />
        <button mat-flat-button type="submit" [disabled]="!singleCar || updateCarForm.untouched">Update car</button>
      </form>
    </div>
    <div class="cars-buttons-generate">
      <button mat-flat-button (click)="generateRandomCars()">Generate cars</button>
    </div>
  </section>`,
  styleUrl: './cars-buttons.component.scss',
})
export class CarsButtonsComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly carsService = inject(CarsService);
  private readonly cdRef = inject(ChangeDetectorRef);

  @Input() singleCar: Car | undefined;
  @Input() CURRENT_PAGE: number = 1;
  @Output() updateTotalCarsCount = new EventEmitter();
  @Output() startAllCars = new EventEmitter<void>();
  @Output() resetAllCars = new EventEmitter<void>();

  createCarForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    color: ['#000000'],
  });

  updateCarForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    color: ['#000000'],
  });

  private readonly colorChangeType = {
    update: this.updateCarForm,
    create: this.createCarForm,
  };

  ngOnChanges({ singleCar }: SimpleChanges): void {
    if (singleCar?.currentValue) {
      this.updateCarForm.patchValue(singleCar.currentValue);
    }
  }
  onSubmitCreateCar(): void {
    if (this.createCarForm.valid) {
      const newCar = this.createCarForm.value as Car;
      this.carsService.createCar(newCar, this.CURRENT_PAGE).subscribe(() => {
        this.updateTotalCarsCount.emit(this.carsService.totalCarsCount);
        this.cdRef.markForCheck();
      });
      this.createCarForm.get('name')?.reset();
    }
  }
  onSubmitUpdateCar(): void {
    if (this.updateCarForm.valid && this.singleCar && this.updateCarForm.touched) {
      const updatedCar = { ...this.updateCarForm.value, id: this.singleCar.id } as Car;
      this.carsService.updateCar(updatedCar).subscribe();
    }
  }
  onUpdateColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.updateCarForm.get('color')?.patchValue(color);
  }
  onCreateColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.createCarForm.get('color')?.setValue(color);
  }
  onColorChangeEvent(/* event: Event , colorChangeType = this.colorChangeType */): void {
    //!TODO Make reusable function for colorChanging
  }
  generateRandomCars(): void {
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
  onPlayAllCars(): void {
    this.startAllCars.emit();
  }
  onResetAllCars(): void {
    this.resetAllCars.emit();
  }
}
