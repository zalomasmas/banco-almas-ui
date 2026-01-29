import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LegacyService } from '../../core/services/legacy.service';
import { LegacyContact, LegacySettings } from '../../core/models/legacy';

@Component({
  selector: 'app-legacy-config',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class LegacyConfigComponent {
  settings!: LegacySettings;
  name = '';
  email = '';
  constructor(private legacy: LegacyService) {
    this.settings = this.legacy.get();
  }
  add() {
    if (!this.name || !this.email) return;
    const c: LegacyContact = { id: crypto.randomUUID(), name: this.name, email: this.email };
    this.settings.contacts.push(c);
    this.name = '';
    this.email = '';
  }
  save() {
    this.legacy.save(this.settings);
    alert('Configuración guardada');
  }
}
