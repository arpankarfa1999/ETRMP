import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, throwError, timer } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

// Central place for: retry logic on transient failures, converting raw
// HTTP errors into user-friendly toast messages, and forcing logout on 401.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    // Retry idempotent GET requests up to twice with a short delay -
    // helps ride out flaky network blips without bothering the user.
    retry({
      count: req.method === 'GET' ? 2 : 0,
      delay: (_error, retryCount) => timer(retryCount * 500)
    }),
    catchError((error: HttpErrorResponse) => {
      let message = 'Something went wrong. Please try again.';

      if (error.status === 0) {
        message = 'Cannot reach the server. Check your connection.';
      } else if (error.status === 401) {
        message = 'Your session has expired. Please log in again.';
        auth.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        message = 'You do not have permission to do that.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      }

      notify.error(message);
      return throwError(() => error);
    })
  );
};
