import { Injectable } from '@angular/core';
import { Car } from '../../models/api.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs/internal/observable/of';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject, catchError, retry, tap } from 'rxjs';
import { ErrorsService } from './errors.service';

@Injectable({
  providedIn: 'root',
})
export class CarsService {
  private carsSubject = new BehaviorSubject<Car[]>([]);
  public cars$ = this.carsSubject.asObservable();
  private headers = new HttpHeaders();

  constructor(
    private http: HttpClient,
    private errorsHandler: ErrorsService
  ) {}

  readAllCars() {
    if (this.carsSubject.value.length) {
      console.log('cached');
      return of(this.carsSubject.getValue());
    }
    return this.http.get<Car[]>(`${environment.apiGarage}`).pipe(
      tap((responseCars: Car[]) => {
        this.carsSubject.next(responseCars);
      }),
      retry({ count: 2, delay: 4000 }),
      catchError(this.errorsHandler.handleError)
    );
  }
  deleteSingleCar(payloadCar: Car) {
    return this.http.delete(`${environment.apiGarage}/${payloadCar?.id}`).pipe(
      tap(() => {
        const updatedCars = this.carsSubject.value.filter((deletedCar) => deletedCar.id !== payloadCar.id);
        return this.carsSubject.next(updatedCars);
      }),
      retry({ count: 2, delay: 5000 }),
      catchError(this.errorsHandler.handleError)
    );
  }
}
