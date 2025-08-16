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
  DestroyRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Car } from '../../../../models/api.models';
import { CarsService } from '../../../services/core/cars/cars.service';
import { switchMap, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
        <input type="color" aria-label="Car color" (change)="onColorChangeEvent($event, 'create')" />
        <button mat-flat-button type="submit" [disabled]="!createCarForm.dirty || createCarForm.invalid">
          Create car
        </button>
      </form>
    </div>
    <div class="cars-buttons-update">
      <form [formGroup]="updateCarForm" (ngSubmit)="onSubmitUpdateCar()">
        <input formControlName="name" required type="text" placeholder="Update car brand" />
        <input
          type="color"
          aria-label="Car color"
          [value]="updateCarForm.get('color')?.value"
          (change)="onColorChangeEvent($event, 'update')"
        />
        <button mat-flat-button type="submit" [disabled]="!updateCarForm.dirty || updateCarForm.invalid || !singleCar">
          Update car
        </button>
      </form>
    </div>
    <div class="cars-buttons-generate">
      <button mat-flat-button (click)="generateRandomCars()">Generate cars</button>
    </div>

    <div class="cars-buttons-alerts">
      @if (singleCar && updateCarForm.invalid && (updateCarForm.dirty || updateCarForm.touched)) {
        @switch (true) {
          @case (updateCarForm.get('name')?.hasError('minlength')) {
            <p>Name must be at least 3 characters long.</p>
          }
          @case (updateCarForm.get('name')?.hasError('required')) {
            <p>Name is required</p>
          }
        }
      }
      @if (createCarForm.invalid && (createCarForm.dirty || createCarForm.touched)) {
        @switch (true) {
          @case (createCarForm.get('name')?.hasError('minlength')) {
            <p>Name must be at least 3 characters long.</p>
          }
          @case (createCarForm.get('name')?.hasError('required')) {
            <p>Name is required</p>
          }
        }
      }
    </div>
  </section>`,
  styleUrl: './cars-buttons.component.scss',
})
export class CarsButtonsComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly carsService = inject(CarsService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() singleCar: Car | undefined;
  @Input() CURRENT_PAGE: number = 1;
  @Output() updateTotalCarsCount = new EventEmitter<number>();
  @Output() startAllCars = new EventEmitter<void>();
  @Output() resetAllCars = new EventEmitter<void>();
  readonly createCarForm: FormGroup = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)], updateOn: 'blur' }),
    color: this.fb.control('#000', { updateOn: 'blur' }),
  });

  readonly updateCarForm: FormGroup = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)], updateOn: 'blur' }),
    color: this.fb.control('#000', { updateOn: 'blur' }),
  });

  ngOnChanges({ singleCar }: SimpleChanges): void {
    if (singleCar?.currentValue) {
      this.updateCarForm.patchValue(singleCar.currentValue);
      this.updateCarForm.markAsPristine();
    }
  }
  onColorChangeEvent(event: Event, changeEventType: 'update' | 'create'): void {
    const color = (event.target as HTMLInputElement).value;
    const form = changeEventType === 'update' ? this.updateCarForm : this.createCarForm;
    if (form.get('color')?.value !== color) {
      form.get('color')?.setValue(color);
      form.get('color')?.markAsDirty();
      form.get('color')?.markAsTouched();
    }
  }
  onSubmitCreateCar(): void {
    const newCar = this.createCarForm.value as Car;
    this.carsService
      .createCar(newCar, this.CURRENT_PAGE)
      .pipe(
        take(1),
        tap(() => {
          this.updateTotalCarsCount.emit(this.carsService.totalCarsCount);
          this.createCarForm.reset({ name: '', color: '#000' });
        })
      )
      .subscribe();
  }

  onSubmitUpdateCar(): void {
    if (this.updateCarForm.valid && this.singleCar && this.updateCarForm.dirty) {
      const updatedCar = { ...this.updateCarForm.value, id: this.singleCar.id } as Car;
      this.carsService.updateCar(updatedCar).pipe(take(1)).subscribe();
    }
    this.updateCarForm.markAsPristine();
  }
  generateRandomCars(): void {
    this.carsService
      .createRandomCars()
      .pipe(
        switchMap(() => {
          this.updateTotalCarsCount.emit(this.carsService.totalCarsCount);
          return this.carsService.readAllCars(this.CURRENT_PAGE);
        }),
        takeUntilDestroyed(this.destroyRef)
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
