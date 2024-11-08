import { Routes } from '@angular/router';
import { CarsListComponent } from './garage/containers/cars-list/cars-list.component';
import { WinnersListComponent } from './winners/containers/winners-list/winners-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'garage',
    pathMatch: 'full',
  },
  { path: 'garage', component: CarsListComponent },
  { path: 'winners', component: WinnersListComponent },
  { path: '**', redirectTo: 'garage' },
];
