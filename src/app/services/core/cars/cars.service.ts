import { inject, Injectable } from '@angular/core';
import { Car } from '../../../../models/api.models';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { BehaviorSubject, catchError, forkJoin, map, retry, switchMap, tap } from 'rxjs';
import { ErrorsService } from '../../errors.service';
import { RandomCarsService } from '../../feature/random-cars.service';
import { defaultHeaders } from '../../../../models/constants';

@Injectable({
  providedIn: 'root',
})
export class CarsService {
  private readonly randomCars = inject(RandomCarsService);
  private readonly http = inject(HttpClient);
  private readonly errorsHandler = inject(ErrorsService);
  private readonly LIMIT_PAGE = 7;
  private carsSubject = new BehaviorSubject<Car[]>([]);

  public totalCarsCount = 0;
  public cars$ = this.carsSubject.asObservable();

  readAllCars(page: number = 1) {
    const params = new HttpParams().set('_page', page).set('_limit', this.LIMIT_PAGE);
    return this.http.get<Car[]>(`${environment.apiGarage}`, { params, observe: 'response' }).pipe(
      map((responseCars) => {
        this.totalCarsCount = Number(responseCars.headers.get('X-Total-Count') || 0);
        return responseCars.body || [];
      }),
      tap((responseCars) => this.carsSubject.next(responseCars)),
      retry({ count: 2, delay: 4000 }),
      catchError(this.errorsHandler.handleError)
    );
  }
  readSingleCar(id: number | undefined) {
    return this.http
      .get<Car>(`${environment.apiGarage}/${id}`)
      .pipe(retry({ count: 2, delay: 4000 }), catchError(this.errorsHandler.handleError));
  }
  findCarNameById(id: number | undefined) {
    return this.readSingleCar(id).pipe(
      map((responseCar) => {
        if (responseCar) return responseCar.name;
        return '';
      })
    );
  }

  deleteSingleCar(payloadCar: Car) {
    return this.http.delete(`${environment.apiGarage}/${payloadCar?.id}`).pipe(
      tap(() => {
        const updatedCars = this.carsSubject.value.filter((deletedCar) => deletedCar.id !== payloadCar.id);
        this.totalCarsCount -= 1;
        this.carsSubject.next(updatedCars);
      }),
      retry({ count: 2, delay: 5000 }),
      catchError(this.errorsHandler.handleError)
    );
  }
  createCar(payloadCar: Car, currentPage: number = 1) {
    const headers = new HttpHeaders(defaultHeaders);
    return this.http
      .post<Car>(`${environment.apiGarage}`, payloadCar, {
        headers: headers,
      })
      .pipe(
        tap((newCar: Car) => {
          this.totalCarsCount += 1;
          if (this.totalCarsCount > this.LIMIT_PAGE * (currentPage - 1)) {
            this.carsSubject.next([...this.carsSubject.value, newCar]);
          }
        }),
        switchMap(() => this.readAllCars(currentPage)),
        retry({ count: 2, delay: 5000 }),
        catchError(this.errorsHandler.handleError)
      );
  }
  updateCar(payloadCar: Car) {
    const headers = new HttpHeaders(defaultHeaders);
    return this.http
      .put<Car>(`${environment.apiGarage}/${payloadCar.id}`, payloadCar, {
        headers: headers,
      })
      .pipe(
        tap(() => {
          const updatedCars = this.carsSubject.value.map((car) => {
            if (car.id === payloadCar.id) {
              return { ...car, ...payloadCar };
            }
            return car;
          });
          this.carsSubject.next(updatedCars);
        }),
        retry({ count: 2, delay: 5000 }),
        catchError(this.errorsHandler.handleError)
      );
  }
  createRandomCars() {
    const headers = new HttpHeaders(defaultHeaders);
    const createRequests = this.randomCars.createArrayCars().map((car) => {
      return this.http.post<Car>(`${environment.apiGarage}`, car, { headers: headers });
    });
    return forkJoin(createRequests).pipe(
      tap((createdCars) => {
        const currentCars = this.carsSubject.value;
        this.carsSubject.next([...currentCars, ...createdCars]);
        this.totalCarsCount += createdCars.length;
      }),
      catchError(this.errorsHandler.handleError)
    );
  }
}
