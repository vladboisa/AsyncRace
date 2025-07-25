import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterModule, RouterOutlet } from '@angular/router';
import { LoaderComponent } from './loader/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, MatButtonModule, LoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Async Race game';
}
