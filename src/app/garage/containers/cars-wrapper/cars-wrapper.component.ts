import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CarsCardComponent } from '../../components/cars-card/cars-card.component';
import { Car } from '../../../../models/api.models';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CarsService } from '../../../services/cars.service';
import { CarsButtonsComponent } from '../../components/cars-buttons/cars-buttons.component';

@Component({
  selector: 'app-cars-wrapper',
  standalone: true,
  imports: [MatPaginatorModule, CarsCardComponent, CommonModule, CarsButtonsComponent, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-cars-buttons
      [carId]="carId"
      (updatedTotalCarsCount)="handleUpdatedCarsCount($event)"
      [CURRENT_PAGE]="CURRENT_PAGE"
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
  private LIMIT_PAGE = 7;

  protected CURRENT_PAGE = 1;
  protected cars$ = this.carsService.cars$;
  protected carId: Car['id'];

  public totalCarsCount = this.carsService.totalCarsCount;
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
    this.carsService.deleteSingleCar(car).subscribe({
      next: () => {
        if (this.totalCarsCount - 1 < (this.CURRENT_PAGE - 1) * this.LIMIT_PAGE) {
          this.CURRENT_PAGE -= 1;
        }
      },
      error: (err) => console.log(`Error from Delete : ${console.dir(err)}`),
    });
    this.cdRef.detectChanges();
  }
  onPageChange(event: PageEvent) {
    this.CURRENT_PAGE = event.pageIndex + 1;
    this.fetchCars(this.CURRENT_PAGE);
  }
  private fetchCars(page: number) {
    this.carsService.readAllCars(page).subscribe(() => {
      this.totalCarsCount = this.carsService.totalCarsCount;
      console.log(this.totalCarsCount);
      this.cdRef.markForCheck();
    });
  }
}
