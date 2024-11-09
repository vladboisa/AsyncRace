import { Component } from '@angular/core';
import { CarsWrapperComponent } from '../../components/cars-wrapper/cars-wrapper.component';
import { CarsButtonsComponent } from '../../components/cars-buttons/cars-buttons.component';

@Component({
  selector: 'app-cars-list',
  standalone: true,
  imports: [CarsWrapperComponent, CarsButtonsComponent],
  template: `
    <main>
      <app-cars-buttons />
      <app-cars-wrapper />
    </main>
  `,
  styleUrl: './cars-list.component.scss',
})
export class CarsListComponent {}
