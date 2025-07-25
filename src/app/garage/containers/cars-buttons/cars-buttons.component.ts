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
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
        <input type="color" (change)="onColorChangeEvent($event, 'create')" />
        <button mat-flat-button type="submit" [disabled]="createCarForm.untouched">Create car</button>
      </form>
    </div>
    <div class="cars-buttons-update">
      <form [formGroup]="updateCarForm" (ngSubmit)="onSubmitUpdateCar()">
        <input formControlName="name" required type="text" placeholder="Update car brand" />
        <input
          type="color"
          [value]="updateCarForm.get('color')?.value"
          (change)="onColorChangeEvent($event, 'update')"
        />

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
    name: new FormControl('', { updateOn: 'blur' }),
    color: new FormControl('#000', { updateOn: 'blur' }),
  });

  updateCarForm: FormGroup = this.fb.group({
    name: new FormControl('', { updateOn: 'blur' }),
    color: new FormControl('#000000', { updateOn: 'blur' }),
  });

  ngOnChanges({ singleCar }: SimpleChanges): void {
    if (singleCar?.currentValue) {
      this.updateCarForm.patchValue(singleCar.currentValue);
    }
  }
  onColorChangeEvent(event: Event, changeEventType: 'update' | 'create'): void {
    const color = (event.target as HTMLInputElement).value;
    const form = changeEventType === 'update' ? this.updateCarForm : this.createCarForm;
    form.get('color')?.patchValue(color);
    form.markAsTouched();
  }
  onSubmitCreateCar(): void {
    if (this.createCarForm.invalid) {
      this.createCarForm.markAllAsTouched();
    }
    const newCar = this.createCarForm.value as Car;
    this.carsService.createCar(newCar, this.CURRENT_PAGE).subscribe(() => {
      this.updateTotalCarsCount.emit(this.carsService.totalCarsCount);
      this.cdRef.markForCheck();
      this.createCarForm.reset({ name: '', color: '#000000' });
    });
  }

  onSubmitUpdateCar(): void {
    if (this.updateCarForm.valid && this.singleCar && this.updateCarForm.touched) {
      const updatedCar = { ...this.updateCarForm.value, id: this.singleCar.id } as Car;
      this.carsService.updateCar(updatedCar).subscribe();
    }
    this.updateCarForm.markAsUntouched();
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
