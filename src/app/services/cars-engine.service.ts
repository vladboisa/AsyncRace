import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ErrorsService } from './errors.service';
import { CarEngineStatus, CarStatus, Speed } from '../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class CarsEngineService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  constructor(
    private http: HttpClient,
    private errorsHandler: ErrorsService
  ) {}

  getCarVelocity(id: number | undefined) {
    if (id) {
      return this.http
        .patch<Speed>(`${environment.apiEngine}?id=${id}&status=${CarStatus.started}`, {
          headers: this.headers,
        })
        .pipe(catchError(this.errorsHandler.handleError));
    } else return;
  }

  startCar(id: number | undefined) {
    return this.http
      .patch<CarEngineStatus>(`${environment.apiEngine}?id=${id}&status=${CarStatus.drive}`, {
        headers: this.headers,
      })
      .pipe(catchError(this.errorsHandler.handleError));
  }

  stopCar(id: number | undefined) {
    return this.http.get(`${environment.apiEngine}?id=${id}&status=${CarStatus.stopped}`, {
      headers: this.headers,
    });
  }
}
