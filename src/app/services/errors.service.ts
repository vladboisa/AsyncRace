import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  constructor() {}
  handleError(err: HttpErrorResponse) {
    if (err.error instanceof ErrorEvent) {
      console.error('Client error');
      return throwError(() => new Error(err.message));
    } else {
      console.error('Server error');
      return throwError(() => new Error(err.message));
    }
  }
}
