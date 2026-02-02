import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LegacyService } from '../../core/services/legacy.service';
import { LegacyContact, LegacySettings } from '../../core/models/legacy';

function randomId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID();
    }
  } catch {}
  const tpl = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return tpl.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
    const c: LegacyContact = { id: randomId(), name: this.name, email: this.email };
    this.settings.contacts.push(c);
    this.name = '';
    this.email = '';
  }
  save() {
    this.legacy.save(this.settings);
    alert('Configuración guardada');
  }
}
