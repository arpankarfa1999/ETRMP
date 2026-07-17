import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

// Central place where all app-wide providers are registered.
// This replaces the old AppModule + BrowserModule.forRoot() style setup.
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(
      // Interceptors run in order: auth token -> loading spinner -> error handling
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
    ),
    importProvidersFrom(
      ToastrModule.forRoot({ positionClass: 'toast-top-right', timeOut: 3000 })
    )
  ]
};
