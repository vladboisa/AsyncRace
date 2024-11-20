import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ErrorsService } from '../../errors.service';
import { CarEngineStatus, CarStatus, Speed } from '../../../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class CarsEngineService {
  private readonly http = inject(HttpClient);
  private readonly errorsHandler = inject(ErrorsService);
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  getCarVelocity(id: number | undefined) {
    if (id) {
      return this.http
        .patch<Speed>(`${environment.apiEngine}?id=${id}&status=${CarStatus.started}`, {
          headers: this.headers,
        })
        .pipe(catchError(this.errorsHandler.handleError));
    } else return EMPTY;
  }

  startCar(id: number | undefined) {
    return this.http
      .patch<CarEngineStatus>(`${environment.apiEngine}?id=${id}&status=${CarStatus.drive}`, {
        headers: this.headers,
      })
      .pipe(catchError(this.errorsHandler.handleEngineError));
  }

  stopCar(id: number | undefined) {
    return this.http.patch(`${environment.apiEngine}?id=${id}&status=${CarStatus.stopped}`, {
      headers: this.headers,
    });
  }
}
