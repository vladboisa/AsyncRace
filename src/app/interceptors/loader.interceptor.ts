import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/feature/loader.service';
import { finalize } from 'rxjs/internal/operators/finalize';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  loaderService.showLoader();
  return next(req).pipe(
    finalize(() => {
      loaderService.hideLoader();
    })
  );
};
