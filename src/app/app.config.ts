import { ApplicationConfig } from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { globalErrorHandlerInterceptor } from './interceptors/global-error-handler.interceptor';
import { SimpleRouteReuseStrategy } from './route-reuse-strategy';
import { loaderInterceptor } from './interceptors/loader.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([globalErrorHandlerInterceptor, loaderInterceptor])),
    { provide: RouteReuseStrategy, useClass: SimpleRouteReuseStrategy },
  ],
};
