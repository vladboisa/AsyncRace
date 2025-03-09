import { bootstrapApplication, enableDebugTools } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { isDevMode } from '@angular/core';

bootstrapApplication(AppComponent, appConfig)
  .then((injector) => {
    if (isDevMode()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enableDebugTools(injector as any);
    }
  })
  .catch((err) => console.error(err));
