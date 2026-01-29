import { Routes } from '@angular/router';
import { Onboarding1Component } from './page1.component';
import { Onboarding2Component } from './page2.component';
import { Onboarding3Component } from './page3.component';
import { Onboarding4Component } from './page4.component';

export const routes: Routes = [
  { path: '1', component: Onboarding1Component },
  { path: '2', component: Onboarding2Component },
  { path: '3', component: Onboarding3Component },
  { path: '4', component: Onboarding4Component }
];
