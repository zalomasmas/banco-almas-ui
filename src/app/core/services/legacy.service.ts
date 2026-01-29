import { Injectable } from '@angular/core';
import { LegacySettings } from '../models/legacy';

const LEGACY_KEY = 'ba_legacy';

@Injectable({ providedIn: 'root' })
export class LegacyService {
  get(): LegacySettings {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) return JSON.parse(raw);
    const base: LegacySettings = { id: 'settings', contacts: [], farewellMessage: '' };
    localStorage.setItem(LEGACY_KEY, JSON.stringify(base));
    return base;
  }

  save(settings: LegacySettings) {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(settings));
    return settings;
  }
}
