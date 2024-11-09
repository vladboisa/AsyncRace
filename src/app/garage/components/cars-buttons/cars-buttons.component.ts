import { MatInputModule } from '@angular/material/input';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-cars-buttons',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, FormsModule, MatInputModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <section class="cars-buttons">
    <div class="cars-buttons-engine">
      <button mat-flat-button>
        <mat-icon fontIcon="play_arrow"></mat-icon>
        Play
      </button>
      <button mat-flat-button>
        <mat-icon fontIcon="replay"></mat-icon>
        Reset
      </button>
    </div>
    <div class="cars-buttons-create">
      <input matInput type="text" placeholder="Create car brand" />
      <input type="color" />
      <button mat-flat-button>Create car</button>
    </div>
    <div class="cars-buttons-update">
      <input matInput type="text" placeholder="Update car brand" />
      <input type="color" />
      <button mat-flat-button>Update car</button>
    </div>
    <div class="carsButtons-generate">
      <button mat-flat-button>Generate cars</button>
    </div>
  </section>`,
  styleUrl: './cars-buttons.component.scss',
})
export class CarsButtonsComponent {}
