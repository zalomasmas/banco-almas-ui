import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const StartGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/onboarding/1']);
  if (!auth.getOnboardingCompleted()) return router.createUrlTree(['/onboarding/1']);
  return router.createUrlTree(['/app/home']);
};
