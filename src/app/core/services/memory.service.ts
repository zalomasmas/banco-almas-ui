import { Injectable } from '@angular/core';
import { Memory } from '../models/memory';
import { MemoryNode } from '../models/memory-node';
import { MediaItem } from '../models/media-item';

const MEMORIES_KEY = 'ba_memories';
const NODES_KEY = 'ba_nodes';

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

@Injectable({ providedIn: 'root' })
export class MemoryService {
  getNodes(): MemoryNode[] {
    const raw = localStorage.getItem(NODES_KEY);
    if (raw) return JSON.parse(raw);
    const base: MemoryNode[] = [
      { id: 'familia', name: 'Familia', icon: 'people' },
      { id: 'amigos', name: 'Amigos', icon: 'groups' },
      { id: 'mascota', name: 'Mascota', icon: 'pets' },
      { id: 'otros', name: 'Otros', icon: 'category' }
    ];
    localStorage.setItem(NODES_KEY, JSON.stringify(base));
    return base;
  }

  list(): Memory[] {
    const raw = localStorage.getItem(MEMORIES_KEY);
    if (raw) return JSON.parse(raw);
    const now = new Date();
    const base: Memory[] = [
      this.createBase('Primer paseo', 'familia', now, true),
      this.createBase('Fiesta sorpresa', 'amigos', addDays(now, -2), false),
      this.createBase('Llegada de Luna', 'mascota', addDays(now, -15), true),
      this.createBase('Graduación', 'otros', addDays(now, -200), true),
      this.createBase('Vacaciones', 'familia', addDays(now, -30), false),
      this.createBase('Reencuentro', 'amigos', addDays(now, -7), true)
    ];
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(base));
    return base;
  }

  get(id: string) {
    return this.list().find(m => m.id === id) || null;
  }

  create(data: Omit<Memory, 'id' | 'createdAt'>) {
    const list = this.list();
    const item: Memory = { ...data, id: randomId(), createdAt: new Date().toISOString() };
    list.unshift(item);
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(list));
    return item;
  }

  update(id: string, patch: Partial<Memory>) {
    const list = this.list();
    const idx = list.findIndex(m => m.id === id);
    if (idx < 0) return null;
    const updated = { ...list[idx], ...patch };
    list[idx] = updated;
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(list));
    return updated;
  }

  delete(id: string) {
    const list = this.list().filter(m => m.id !== id);
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(list));
  }

  filterByNode(nodeId: string) {
    return this.list().filter(m => m.nodeId === nodeId);
  }

  filterByDate(dateIso: string) {
    const d = dateIso.slice(0, 10);
    return this.list().filter(m => m.date.slice(0, 10) === d);
  }

  private createBase(title: string, nodeId: string, date: Date, isPublic: boolean): Memory {
    const attachments: MediaItem[] = [];
    return {
      id: randomId(),
      title,
      text: 'Contenido de recuerdo',
      nodeId,
      date: date.toISOString(),
      isPublic,
      attachments,
      createdAt: new Date().toISOString()
    };
  }
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
