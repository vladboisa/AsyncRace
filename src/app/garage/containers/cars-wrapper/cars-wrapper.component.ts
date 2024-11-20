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
import { CarsCardComponent } from '../cars-card/cars-card.component';
import { Car, Winner } from '../../../../models/api.models';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CarsService } from '../../../services/core/cars/cars.service';
import { CarsButtonsComponent } from '../cars-buttons/cars-buttons.component';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { WinnersService } from '../../../services/core/winners/winners.service';

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
})
export class CarsWrapperComponent implements OnInit {
  private readonly carsService = inject(CarsService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly winnersService = inject(WinnersService);
  private readonly LIMIT_PAGE = 7;
  protected CURRENT_PAGE = 1;
  protected cars$ = this.carsService.cars$;
  protected carId: Car['id'];
  public totalCarsCount = this.carsService.totalCarsCount;

  @ViewChildren(CarsCardComponent) carComponents!: QueryList<CarsCardComponent>;

  ngOnInit(): void {
    this.fetchCars(this.CURRENT_PAGE);
  }
  trackById(index: number, name: Car): number | undefined {
    return name.id;
  }
  handleUpdatedCarsCount(total: number): void {
    this.totalCarsCount = total;
  }
  handleCarId(selectedCarId: Car['id']): void {
    this.carId = selectedCarId;
  }
  handleDeleteCar(car: Car): void {
    this.carsService.deleteSingleCar(car).subscribe(() => {
      if (this.totalCarsCount - 1 < (this.CURRENT_PAGE - 1) * this.LIMIT_PAGE) {
        this.CURRENT_PAGE -= 1;
      }
    });
    this.cdRef.markForCheck();
  }
  handleStartAllCars(): void {
    const raceObservables = this.carComponents.map((carComponent: CarsCardComponent) => carComponent.onPlayClick());
    forkJoin(raceObservables).subscribe((results: Winner[]) => {
      const winner = this.winnersService.findMinTimeWinner(results);
      if (winner) {
        alert(`Winner: ${winner?.name}`);
        const winnerPayload: Winner = { id: winner?.id, wins: 1, time: winner?.time };
        this.winnersService.handleWinnerAfterRace(winnerPayload).subscribe({
          error: (err) => console.error('Error handling winner:', err),
        });
      }
    });
  }

  handleResetAllCars(): void {
    const resetObservables = this.carComponents.map((carComponent: CarsCardComponent) => {
      return carComponent.resetCarPosition();
    });
    forkJoin(resetObservables).subscribe({
      error: (error) => {
        console.error('Error during reset all cars', error);
      },
    });
  }
  onPageChange(event: PageEvent): void {
    this.CURRENT_PAGE = event.pageIndex + 1;
    this.fetchCars(this.CURRENT_PAGE);
  }
  private fetchCars(page: number): void {
    this.carsService.readAllCars(page).subscribe(() => {
      this.totalCarsCount = this.carsService.totalCarsCount;
      this.cdRef.markForCheck();
    });
  }
}
