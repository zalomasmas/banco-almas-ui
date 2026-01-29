import { Injectable } from '@angular/core';
import { ShareLink } from '../models/share';
import { MemoryService } from './memory.service';

const SHARE_KEY = 'ba_share';
const DEFAULT_TOKEN = 'mock-token-123';

@Injectable({ providedIn: 'root' })
export class ShareService {
  constructor(private memories: MemoryService) {}

  getByToken(token: string): ShareLink | null {
    const all = this.getAll();
    return all.find(s => s.token === token) || null;
  }

  getAll(): ShareLink[] {
    const raw = localStorage.getItem(SHARE_KEY);
    if (raw) return JSON.parse(raw);
    const mems = this.memories.list().filter(m => m.isPublic);
    const base: ShareLink[] = [
      {
        token: DEFAULT_TOKEN,
        items: mems.slice(0, 3).map(m => ({ memoryId: m.id, title: m.title })),
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(SHARE_KEY, JSON.stringify(base));
    return base;
  }
}
