import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { throwError } from 'rxjs/internal/observable/throwError';
import { AnimationService } from './feature/animation.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  private readonly animationCarService = inject(AnimationService);

  handleError(err: HttpErrorResponse): Observable<never> {
    console.error(err.error instanceof ErrorEvent ? 'Client Error side' : 'Server Error');
    return throwError(() => new Error(err.message));
  }
  handleEngineError(err: HttpErrorResponse): Observable<never> {
    this.animationCarService.cancelAnimation();
    return throwError(
      () => new Error(err?.status === 500 ? "Car has been stopped suddenly. It's engine was broken down." : err.message)
    );
  }
}
