import { defaultParams } from './../../../../models/constants';
import { inject, Injectable } from '@angular/core';
import { Car } from '../../../../models/api.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { BehaviorSubject, forkJoin, map, Observable, switchMap, tap } from 'rxjs';
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

  readAllCars(page: number = 1): Observable<Car[]> {
    const params = defaultParams(page, this.LIMIT_PAGE);
    return this.http.get<Car[]>(`${environment.apiGarage}`, { params, observe: 'response' }).pipe(
      map((responseCars) => {
        this.totalCarsCount = Number(responseCars.headers.get('X-Total-Count') || 0);
        return responseCars.body || [];
      }),
      tap((responseCars) => this.carsSubject.next(responseCars))
    );
  }
  findCarNameById(id: number | undefined): Observable<string> {
    return this.readAllCars().pipe(
      map((responseCars) => {
        const findedCarById = responseCars.find((elem: Car) => elem.id === id);
        if (findedCarById) return findedCarById.name;
        return '';
      })
    );
  }
  deleteSingleCar(payloadCar: Car): Observable<object> {
    return this.http.delete(`${environment.apiGarage}/${payloadCar?.id}`).pipe(
      tap(() => {
        const updatedCars = this.carsSubject.value.filter((deletedCar) => deletedCar.id !== payloadCar.id);
        this.totalCarsCount -= 1;
        this.carsSubject.next(updatedCars);
      })
    );
  }
  createCar(payloadCar: Car, currentPage: number = 1): Observable<Car[]> {
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
        switchMap(() => this.readAllCars(currentPage))
      );
  }
  updateCar(payloadCar: Car): Observable<Car> {
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
        })
      );
  }
  createRandomCars(): Observable<Car[]> {
    const headers = new HttpHeaders(defaultHeaders);
    const createRequests = this.randomCars.createArrayCars().map((car) => {
      return this.http.post<Car>(`${environment.apiGarage}`, car, { headers: headers });
    });
    return forkJoin(createRequests).pipe(
      tap((createdCars) => {
        const currentCars = this.carsSubject.value;
        this.carsSubject.next([...currentCars, ...createdCars]);
        this.totalCarsCount += createdCars.length;
      })
    );
  }
}
