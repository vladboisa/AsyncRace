import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-winners-list',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <p>winners-list works!</p> `,
  styleUrl: './winners-list.component.scss',
})
export class WinnersListComponent {}
