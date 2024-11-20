import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ErrorsService } from '../../errors.service';
import { CarEngineStatus, CarStatus, Speed } from '../../../../models/api.models';
import { defaultHeaders } from '../../../../models/constants';

@Injectable({
  providedIn: 'root',
})
export class CarsEngineService {
  private readonly http = inject(HttpClient);
  private readonly errorsHandler = inject(ErrorsService);

  getCarVelocity(id: number | undefined): Observable<Speed> {
    if (id) {
      return this.http.patch<Speed>(`${environment.apiEngine}?id=${id}&status=${CarStatus.started}`, {
        headers: defaultHeaders,
      });
    } else return EMPTY;
  }

  startCar(id: number | undefined): Observable<CarEngineStatus> {
    return this.http.patch<CarEngineStatus>(`${environment.apiEngine}?id=${id}&status=${CarStatus.drive}`, {
      headers: defaultHeaders,
    });
  }

  stopCar(id: number | undefined): Observable<CarEngineStatus | object> {
    return this.http.patch(`${environment.apiEngine}?id=${id}&status=${CarStatus.stopped}`, {
      headers: defaultHeaders,
    });
  }
}
