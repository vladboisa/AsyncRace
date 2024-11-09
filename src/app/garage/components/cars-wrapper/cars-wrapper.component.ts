import { Component } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CarsCardComponent } from '../../containers/cars-card/cars-card.component';

@Component({
  selector: 'app-cars-wrapper',
  standalone: true,
  imports: [MatPaginatorModule, CarsCardComponent],
  template: `
    <section class="cars-wrapper">
      <app-cars-card />
      <mat-paginator class="paginator" [length]="100" [pageSize]="10" aria-label="Select page"> </mat-paginator>
    </section>
  `,
  styleUrl: './cars-wrapper.component.scss',
})
export class CarsWrapperComponent {}
