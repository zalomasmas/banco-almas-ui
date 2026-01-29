import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-onb-4',
  standalone: true,
  templateUrl: './page4.component.html',
  styleUrl: './page4.component.scss'
})
export class Onboarding4Component {
  constructor(private auth: AuthService, private router: Router) {}
  start() {
    this.auth.setOnboardingCompleted(true);
    this.router.navigate(['/bienvenida']);
  }
}
