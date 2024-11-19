import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CarsCardComponent } from '../../components/cars-card/cars-card.component';
import { Car } from '../../../../models/api.models';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CarsService } from '../../../services/core/cars/cars.service';
import { CarsButtonsComponent } from '../../components/cars-buttons/cars-buttons.component';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { ErrorsService } from '../../../services/errors.service';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-cars-wrapper',
  standalone: true,
  imports: [MatPaginatorModule, CarsCardComponent, CommonModule, CarsButtonsComponent, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-cars-buttons
      [carId]="carId"
      [CURRENT_PAGE]="CURRENT_PAGE"
      (updateTotalCarsCount)="handleUpdatedCarsCount($event)"
      (startAllCars)="handleStartAllCars()"
      (resetAllCars)="handleResetAllCars()"
    />
    <ng-container *ngIf="cars$ | async as cars">
      <section class="cars-wrapper" *ngIf="cars.length > 0; else nothing">
        <app-cars-card
          *ngFor="let car of cars; trackBy: trackById"
          [carSingle]="car"
          (emittedCarId)="handleCarId($event)"
          (deletedCar)="handleDeleteCar($event)"
        />
        <mat-paginator
          class="paginator"
          [length]="totalCarsCount"
          [pageSize]="[7]"
          [pageSizeOptions]="[7]"
          (page)="onPageChange($event)"
          aria-label="Select page"
        >
        </mat-paginator>
      </section>
    </ng-container>
    <ng-template #nothing>
      <p style="text-align: center;">No Cars here... Try to enable server</p>
    </ng-template>
  `,
  styleUrl: './cars-wrapper.component.scss',
})
export class CarsWrapperComponent implements OnInit {
  private readonly carsService = inject(CarsService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly errorsService = inject(ErrorsService);
  private readonly LIMIT_PAGE = 7;
  protected CURRENT_PAGE = 1;
  protected cars$ = this.carsService.cars$;
  protected carId: Car['id'];
  public totalCarsCount = this.carsService.totalCarsCount;

  @ViewChildren(CarsCardComponent) carComponents!: QueryList<CarsCardComponent>;
  constructor() {}
  ngOnInit() {
    this.fetchCars(this.CURRENT_PAGE);
  }
  trackById(index: number, name: Car) {
    return name.id;
  }
  handleUpdatedCarsCount(total: number) {
    this.totalCarsCount = total;
  }
  handleCarId(selectedCarId: Car['id']) {
    this.carId = selectedCarId;
  }
  handleDeleteCar(car: Car) {
    this.carsService.deleteSingleCar(car).subscribe(() => {
      if (this.totalCarsCount - 1 < (this.CURRENT_PAGE - 1) * this.LIMIT_PAGE) {
        this.CURRENT_PAGE -= 1;
      }
    });
    this.cdRef.detectChanges();
  }
  handleStartAllCars() {
    const startObservables = this.carComponents.map((carComponent) => {
      const animationStartObservable = of(carComponent.onPlayClick());
      return animationStartObservable;
    });
    forkJoin(startObservables).subscribe({
      error: (error) => console.error(error),
    });
  }
  handleResetAllCars() {
    const resetObservables = this.carComponents.map((carComponent) => {
      return carComponent.resetCarPosition();
    });
    forkJoin(resetObservables).subscribe({
      next: () => {
        console.log('All cars reset!');
      },
      error: (error) => {
        console.error('Error during reset', error);
      },
      complete: () => {
        console.log('Reset completed for all cars');
      },
    });
  }
  onPageChange(event: PageEvent) {
    this.CURRENT_PAGE = event.pageIndex + 1;
    this.fetchCars(this.CURRENT_PAGE);
  }
  private fetchCars(page: number) {
    this.carsService.readAllCars(page).subscribe(() => {
      this.totalCarsCount = this.carsService.totalCarsCount;
      this.cdRef.markForCheck();
    });
  }
}
