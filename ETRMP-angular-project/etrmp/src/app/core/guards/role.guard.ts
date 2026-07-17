import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

// Guard FACTORY: call roleGuard(['Admin']) inside the route config and it
// returns a CanActivateFn configured for those roles. This lets one guard
// implementation protect many routes with different allowed roles.
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const notify = inject(NotificationService);

    if (auth.hasRole(allowedRoles)) {
      return true;
    }

    notify.warning('You do not have permission to view that page.');
    router.navigate(['/dashboard']);
    return false;
  };
}
