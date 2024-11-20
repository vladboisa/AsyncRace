import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CarsWrapperComponent } from '../../containers/cars-wrapper/cars-wrapper.component';

@Component({
  selector: 'app-cars-list',
  standalone: true,
  imports: [CarsWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <app-cars-wrapper />
    </main>
  `,
})
export class CarsListComponent {}
