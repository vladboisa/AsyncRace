import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorsService } from '../../errors.service';
import { Winner } from '../../../../models/api.models';
import { of } from 'rxjs/internal/observable/of';
import { environment } from '../../../../environments/environment.development';
import { tap } from 'rxjs/internal/operators/tap';
import { retry } from 'rxjs/internal/operators/retry';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root',
})
export class WinnersService {
  winners: Winner[] = [];
  constructor(
    private http: HttpClient,
    private errorsHandler: ErrorsService
  ) {}

  readAllWinners() {
    if (this.winners.length) {
      return of(this.winners);
    }
    return this.http.get<Winner[]>(`${environment.apiGarage}`).pipe(
      tap((responseCars: Winner[]) => {
        this.winners = responseCars;
      }),
      retry({ count: 2, delay: 4000 }),
      catchError(this.errorsHandler.handleError)
    );
  }
}
