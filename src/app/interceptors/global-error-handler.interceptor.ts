import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry } from 'rxjs';
import { ErrorsService } from '../services/errors.service';

export const globalErrorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const errorsHandler = inject(ErrorsService);

  return next(req).pipe(retry({ count: 2, delay: 5000 }), catchError(errorsHandler.handleError));
};
