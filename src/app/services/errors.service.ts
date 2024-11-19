import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs/internal/observable/throwError';
import { AnimationService } from './feature/animation.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  constructor(public animationCarService: AnimationService) {}
  handleError(err: HttpErrorResponse) {
    if (err.error instanceof ErrorEvent) {
      console.error('Client error');
      return throwError(() => new Error(err.message));
    } else {
      console.error('Server error');
      return throwError(() => new Error(err.message));
    }
  }
  handleEngineError(err: HttpErrorResponse) {
    this.animationCarService.cancelAnimation();
    if (err?.status === 500) {
      return throwError(() => new Error("Car has been stopped suddenly. It's engine was broken down."));
    } else {
      return throwError(() => new Error(err.message));
    }
  }
}
