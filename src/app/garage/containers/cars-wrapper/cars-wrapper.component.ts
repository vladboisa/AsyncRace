import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CarsCardComponent } from '../../components/cars-card/cars-card.component';
import { Car } from '../../../../models/api.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cars-wrapper',
  standalone: true,
  imports: [MatPaginatorModule, CarsCardComponent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="cars.length; else nothing">
      <section class="cars-wrapper">
        <app-cars-card *ngFor="let car of cars; trackBy: trackById" [car]="car" />
        <mat-paginator class="paginator" [length]="100" [pageSize]="10" aria-label="Select page"> </mat-paginator>
      </section>
    </ng-container>
    <ng-template #nothing>
      <p style="text-align: center;">No Cars here... Try to enable server</p>
    </ng-template>
  `,
  styleUrl: './cars-wrapper.component.scss',
})
export class CarsWrapperComponent implements OnInit {
  cars!: Car[];
  constructor() {}
  ngOnInit() {
    this.cars = [{ name: 'string', color: 'string' }];
  }
  trackById(index: number, name: Car) {
    return name.id;
  }
}
