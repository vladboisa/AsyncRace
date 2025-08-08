import { defaultParams } from './../../../../models/constants';
import { inject, Injectable } from '@angular/core';
import { Car } from '../../../../models/api.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
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
  private readonly DEFAULT_HTTP_HEADERS = new HttpHeaders(defaultHeaders);
  private carsSubject = new BehaviorSubject<Car[]>([]);
  carsCache = new Map<number, Car[]>();

  public totalCarsCount = 0;
  public cars$ = this.carsSubject.asObservable();

  readAllCars(page: number = 1): Observable<Car[]> {
    const params = defaultParams(page, this.LIMIT_PAGE);
    console.log(this.carsCache);
    if (this.carsCache.has(page)) {
      console.log('cache', this.carsCache.forEach(console.log));
      return of(this.carsCache.get(page) ?? []);
    }
    return this.http.get<Car[]>(`${environment.apiGarage}`, { params, observe: 'response' }).pipe(
      map((responseCars) => {
        this.totalCarsCount = Number(responseCars.headers.get('X-Total-Count') || 0);
        return responseCars.body || [];
      }),
      tap((responseCars) => {
        console.log('http', responseCars);
        this.carsCache.set(page, responseCars);
        this.carsSubject.next(responseCars);
      })
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
        for (const [page, cars] of this.carsCache.entries()) {
          const deletedCarIndex = cars.findIndex((car: Car) => car.id === payloadCar.id);
          if (deletedCarIndex !== -1) {
            const carsCachecopy = [...cars];
            carsCachecopy.splice(deletedCarIndex, 1);
            this.carsCache.set(page, carsCachecopy);
            break;
          }
        }
        this.totalCarsCount -= 1;
        this.carsSubject.next(updatedCars);
      })
    );
  }
  createCar(payloadCar: Car, currentPage: number = 1): Observable<Car[]> {
    return this.http
      .post<Car>(`${environment.apiGarage}`, payloadCar, {
        headers: this.DEFAULT_HTTP_HEADERS,
      })
      .pipe(
        tap((newCar: Car) => {
          this.totalCarsCount += 1;
          if (this.totalCarsCount > this.LIMIT_PAGE * (currentPage - 1)) {
            this.carsSubject.next([...this.carsSubject.value, newCar]);
            const currentCacheCars = this.carsCache.get(currentPage);
            currentCacheCars?.push(newCar);
          }
        }),
        switchMap(() => this.readAllCars(currentPage))
      );
  }
  updateCar(payloadCar: Car): Observable<Car> {
    return this.http
      .put<Car>(`${environment.apiGarage}/${payloadCar.id}`, payloadCar, {
        headers: this.DEFAULT_HTTP_HEADERS,
      })
      .pipe(
        tap((updatedCarFromServer: Car) => {
          const updatedCars = this.carsSubject.value.map((car) => {
            if (car.id === payloadCar.id) {
              return updatedCarFromServer;
            }
            return car;
          });
          this.carsSubject.next(updatedCars);
          for (const [page, cars] of this.carsCache.entries()) {
            const updatedCarIndex = cars.findIndex((car: Car) => car.id === updatedCarFromServer.id);
            if (updatedCarIndex !== -1) {
              const updatedCarsCache = [...cars];
              updatedCarsCache[updatedCarIndex] = updatedCarFromServer;
              this.carsCache.set(page, updatedCarsCache);
              break;
            }
          }
        })
      );
  }
  createRandomCars(): Observable<Car[]> {
    const createRequests = this.randomCars.createArrayCars().map((car) => {
      return this.http.post<Car>(`${environment.apiGarage}`, car, { headers: this.DEFAULT_HTTP_HEADERS });
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
