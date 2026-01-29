import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WizardService } from './wizard.service';

@Component({
  selector: 'app-new-privacy',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './privacidad-fecha.component.html',
  styleUrl: './privacidad-fecha.component.scss'
})
export class NewPrivacidadFechaComponent {
  constructor(public wiz: WizardService) {}
  get dateOnly() {
    return this.wiz.date.slice(0, 10);
  }
  set dateOnly(d: string) {
    const current = new Date(this.wiz.date);
    const iso = new Date(`${d}T${current.toISOString().slice(11, 19)}Z`).toISOString();
    this.wiz.date = iso;
  }
}
