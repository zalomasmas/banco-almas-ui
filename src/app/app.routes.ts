import { Routes } from '@angular/router';
import { StartGuard } from './core/guards/start.guard';
import { StartComponent } from './start.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

export const routes: Routes = [
  { path: '', component: StartComponent, canActivate: [StartGuard], pathMatch: 'full' },
  { path: 'bienvenida', component: WelcomeComponent },
  {
    path: 'onboarding',
    loadChildren: () => import('./features/onboarding/onboarding.routes').then(m => m.routes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.routes)
  },
  {
    path: 'app',
    loadChildren: () => import('./features/app/app.routes').then(m => m.routes)
  },
  {
    path: 'share',
    loadChildren: () => import('./features/share/share.routes').then(m => m.routes)
  }
];
