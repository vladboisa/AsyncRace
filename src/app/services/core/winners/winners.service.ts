import { Winner } from './../../../../models/api.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ErrorsService } from '../../errors.service';
import { environment } from '../../../../environments/environment.development';
import { tap } from 'rxjs/internal/operators/tap';
import { retry } from 'rxjs/internal/operators/retry';
import { catchError } from 'rxjs/internal/operators/catchError';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { CarsService } from '../cars/cars.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root',
})
export class WinnersService {
  private readonly http = inject(HttpClient);
  private readonly errorsHandler = inject(ErrorsService);
  private readonly carsService = inject(CarsService);
  private winnersSubject = new BehaviorSubject<Winner[]>([]);
  winners$ = this.winnersSubject.asObservable();
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  readAllWinners() {
    return this.http.get<Winner[]>(`${environment.apiWinners}`).pipe(
      switchMap((responseWinners) => {
        const winnersWithCarNames$ = responseWinners.map((winner) =>
          this.carsService.findCarNameById(winner.id).pipe(map((carName: string) => ({ ...winner, name: carName })))
        );
        return forkJoin(winnersWithCarNames$);
      }),
      tap((winnersWithCarNames) => {
        this.winnersSubject.next(winnersWithCarNames);
      }),
      retry({ count: 2, delay: 4000 }),
      catchError(this.errorsHandler.handleError)
    );
  }
  createWinner(payloadWinner: Winner) {
    return this.http
      .post<Winner>(`${environment.apiWinners}`, payloadWinner, {
        headers: this.headers,
      })
      .pipe(
        tap((responseWinner: Winner) => {
          this.winnersSubject.next([...this.winnersSubject.value, responseWinner]);
        }),
        retry({ count: 2, delay: 4000 }),
        catchError(this.errorsHandler.handleError)
      );
  }
  deleteSingleWinner(payloadWinner: Winner) {
    return this.http.delete(`${environment.apiWinners}/${payloadWinner?.id}`).pipe(
      tap(() => {
        const updatedCars = this.winnersSubject.value.filter((deletedWinner) => deletedWinner.id !== payloadWinner.id);
        return this.winnersSubject.next(updatedCars);
      }),
      retry({ count: 2, delay: 5000 }),
      catchError(this.errorsHandler.handleError)
    );
  }
  updateWinner(payloadWinner: Winner) {
    return this.http
      .put<Winner>(`${environment.apiWinners}/${payloadWinner.id}`, payloadWinner, {
        headers: this.headers,
      })
      .pipe(
        tap((updatedWinner: Winner) => {
          const updatedWinners = this.winnersSubject.value.map((winner) =>
            winner.id === updatedWinner.id ? updatedWinner : winner
          );
          this.winnersSubject.next(updatedWinners);
        }),
        retry({ count: 2, delay: 4000 }),
        catchError(this.errorsHandler.handleError)
      );
  }
  handleWinnerAfterRace(winnerPayload: Winner) {
    return this.readAllWinners().pipe(
      switchMap((winners) => {
        const existingWinner = winners.find((winner) => winner.id === winnerPayload.id);
        if (existingWinner) {
          const updatedWinner = this.updateWinnerIfFaster(existingWinner, winnerPayload);
          return this.updateWinner(updatedWinner);
        } else {
          return this.createWinner(winnerPayload);
        }
      })
    );
  }
  private updateWinnerIfFaster(existingWinner: Winner, newWinner: Winner) {
    if (newWinner.time < existingWinner.time) {
      return { ...existingWinner, wins: existingWinner.wins + 1, time: newWinner.time };
    } else {
      return { ...existingWinner, wins: existingWinner.wins + 1 };
    }
  }
  findMinTimeWinner(winnerArray: Winner[]) {
    if (!winnerArray || winnerArray.length === 0) {
      return null;
    }
    const minTime = Math.min(...winnerArray.map((obj) => obj.time));
    return winnerArray.find((obj) => obj.time === minTime);
  }
}
