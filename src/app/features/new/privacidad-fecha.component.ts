import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WizardService } from './wizard.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-new-privacy',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './privacidad-fecha.component.html',
  styleUrl: './privacidad-fecha.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewPrivacidadFechaComponent implements OnInit {
  constructor(public wiz: WizardService) {}
  selectedDate: Date | null = null;
  ngOnInit() {
    this.selectedDate = new Date(this.wiz.date);
  }
  onDateChange(d: Date | null) {
    if (!d) return;
    const current = new Date(this.wiz.date);
    const hours = current.toISOString().slice(11, 19);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = new Date(`${y}-${m}-${day}T${hours}Z`).toISOString();
    this.wiz.date = iso;
  }
}
