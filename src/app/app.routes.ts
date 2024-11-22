import { Routes } from '@angular/router';
import { CarsListComponent } from './garage/components/cars-list/cars-list.component';
import { WinnersListComponent } from './winners/components/winners-list/winners-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'garage',
    pathMatch: 'full',
  },
  { path: 'garage', component: CarsListComponent, data: { reuse: true } },
  { path: 'winners', component: WinnersListComponent },
  { path: '**', redirectTo: 'garage' },
];
