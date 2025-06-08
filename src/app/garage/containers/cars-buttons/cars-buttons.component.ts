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
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-cars-buttons',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, ReactiveFormsModule, CommonModule],
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
        <input formControlName="color" type="color" />
        <button mat-flat-button type="submit" [disabled]="createCarForm.invalid">Create car</button>
      </form>
    </div>
    <div class="cars-buttons-update">
      <form [formGroup]="updateCarForm" (ngSubmit)="onSubmitUpdateCar()">
        <input
          [value]="singleCar?.name"
          (change)="onNameChangeEvent($event, 'update')"
          type="text"
          placeholder="Update car brand"
        />
        <input type="color" [value]="singleCar?.color" (change)="onColorChangeEvent($event, 'update')" />
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
    name: this.fb.control('', {
      validators: [Validators.required],
      updateOn: 'blur',
    }),
    color: this.fb.control('#000000', {
      updateOn: 'blur',
    }),
  });

  updateCarForm: FormGroup = this.fb.group(
    {
      name: ['', Validators.required],
      color: ['#000000'],
    },
    { updateOn: 'submit' }
  );

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
    this.updateCarForm.markAsUntouched();
  }
  onColorChangeEvent(event: Event, type: 'update' | 'create'): void {
    const color = (event.target as HTMLInputElement).value;
    if (type === 'update') {
      this.updateCarForm.get('color')?.patchValue(color);
    }
    if (type === 'create') {
      this.createCarForm.get('color')?.patchValue(color);
    }
  }
  onNameChangeEvent(event: Event, type: 'update' | 'create'): void {
    const name = (event.target as HTMLInputElement).value;
    if (type === 'update') {
      this.updateCarForm.get('name')?.patchValue(name);
      this.updateCarForm.markAsTouched();
    }
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
