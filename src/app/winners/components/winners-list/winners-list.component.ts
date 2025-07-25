import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { WinnersService } from '../../../services/core/winners/winners.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-winners-list',
  standalone: true,
  imports: [MatTableModule, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table mat-table [dataSource]="(winners$ | async) || []" style="margin-top:20px">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>Id</th>
        <td mat-cell *matCellDef="let element">{{ element.id }}</td>
      </ng-container>
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let element">{{ element.name }}</td>
      </ng-container>
      <ng-container matColumnDef="wins">
        <th mat-header-cell *matHeaderCellDef>Wins</th>
        <td mat-cell *matCellDef="let element">{{ element.wins }}</td>
      </ng-container>
      <ng-container matColumnDef="time">
        <th mat-header-cell *matHeaderCellDef>Time</th>
        <td mat-cell *matCellDef="let element">{{ element.time / TIME_CONVERT_RATIO_MS }} sec.</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
    </table>
  `,
})
export class WinnersListComponent implements OnInit {
  readonly TIME_CONVERT_RATIO_MS = 1000;
  private readonly winnersService = inject(WinnersService);
  protected winners$ = this.winnersService.winners$;
  displayedColumns: string[] = ['id', 'name', 'wins', 'time'];
  ngOnInit(): void {
    this.winnersService.readAllWinners().subscribe();
  }
}
