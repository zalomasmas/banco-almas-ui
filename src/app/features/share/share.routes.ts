import { Routes } from '@angular/router';
import { SharePublicComponent } from './share-public.component';

export const routes: Routes = [
  { path: ':token', component: SharePublicComponent }
];
