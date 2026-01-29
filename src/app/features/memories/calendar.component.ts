import { Component, computed, signal, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MemoryService } from '../../core/services/memory.service';
import { Memory } from '../../core/models/memory';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { MemoriesUiStateService } from './ui-state.service';

@Component({
  selector: 'app-memories-calendar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class MemoriesCalendarComponent {
  list = signal<Memory[]>([]);
  year = signal<number>(new Date().getFullYear());
  month = signal<number>(new Date().getMonth());
  days = computed(() => buildMonth(this.year(), this.month()));
  byDate = computed(() => groupByDate(this.list()));
  overlayOpen = signal<boolean>(false);
  overlayItems = signal<Memory[]>([]);
  overlayPos = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  @ViewChild('calNetwork') overlayEl?: ElementRef<HTMLDivElement>;
  private overlayNetwork?: Network;
  private nodesDS?: DataSet<any>;
  constructor(private memService: MemoryService, private router: Router, private ui: MemoriesUiStateService) {
    this.list.set(this.memService.list());
    this.ui.setView('calendario');
    this.year.set(this.ui.calendar.year);
    this.month.set(this.ui.calendar.month);
    if (this.ui.calendar.overlayOpen && this.ui.calendar.overlayItemsIds.length) {
      const ids = this.ui.calendar.overlayItemsIds;
      const map = new Map(this.list().map(m => [m.id, m]));
      const items = ids.map(id => map.get(id)).filter(Boolean) as Memory[];
      this.overlayItems.set(items);
      this.overlayPos.set({ ...this.ui.calendar.overlayPos });
      this.overlayOpen.set(true);
      setTimeout(() => this.renderOverlay(), 0);
    }
  }
  getImageUrl(m: Memory | null) {
    if (!m) return 'https://object.pixocial.com/pixocial/dmxffni837f1xrj8pki9xgrl.jpg';
    const img = m.attachments.find(a => a.type === 'image' && a.url && a.url.trim().length);
    return img?.url || 'https://object.pixocial.com/pixocial/dmxffni837f1xrj8pki9xgrl.jpg';
  }
  monthLabel() {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[this.month()]} ${this.year()}`;
  }
  prevMonth() {
    const m = this.month();
    const y = this.year();
    if (m === 0) {
      this.month.set(11);
      this.year.set(y - 1);
    } else {
      this.month.set(m - 1);
    }
    this.ui.setCalendarMonth(this.year(), this.month());
  }
  nextMonth() {
    const m = this.month();
    const y = this.year();
    if (m === 11) {
      this.month.set(0);
      this.year.set(y + 1);
    } else {
      this.month.set(m + 1);
    }
    this.ui.setCalendarMonth(this.year(), this.month());
  }
  itemsFor(dateKey: string) {
    return this.byDate().get(dateKey) || [];
  }
  dayClick(ev: MouseEvent, dateKey: string) {
    const items = this.itemsFor(dateKey);
    if (items.length === 0) return;
    if (items.length === 1) {
      this.router.navigate(['/app/recuerdos', items[0].id]);
      return;
    }
    const cx = Math.round(ev.clientX);
    const cy = Math.round(ev.clientY);
    this.overlayItems.set(items.slice(0, 18));
    this.overlayPos.set({ x: cx, y: cy });
    this.overlayOpen.set(true);
    this.ui.setOverlay(true, this.overlayItems().map(x => x.id), this.overlayPos());
    setTimeout(() => this.renderOverlay(), 0);
  }
  overlayNavigate(id: string) {
    this.ui.setView('calendario');
    this.router.navigate(['/app/recuerdos', id]);
  }
  closeOverlay() {
    const ids = this.overlayItems().map(x => x.id);
    this.popOut(ids, 220, 8, () => {
      this.overlayOpen.set(false);
      this.ui.clearOverlay();
      this.destroyOverlay();
    });
  }
  private renderOverlay() {
    const container = this.overlayEl?.nativeElement;
    if (!container) {
      setTimeout(() => this.renderOverlay(), 0);
      return;
    }
    const rect = container.getBoundingClientRect();
    const center = this.overlayPos();
    const containerCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const offsetX = center.x - containerCenter.x;
    const offsetY = center.y - containerCenter.y;
    const nodes: Array<any> = [];
    const edges: Array<any> = [];
    const items = this.overlayItems();
    const count = items.length;
    const innerCount = Math.min(6, count);
    const outerCount = Math.min(12, Math.max(0, count - innerCount));
    const r1 = 30;
    const r2 = 56;
    for (let i = 0; i < count; i++) {
      let x = 0;
      let y = 0;
      if (i < innerCount) {
        const angle = (i / innerCount) * Math.PI * 2;
        x = Math.round(r1 * Math.cos(angle));
        y = Math.round(r1 * Math.sin(angle));
      } else {
        const j = i - innerCount;
        const angleStep = (Math.PI * 2) / (outerCount || 1);
        const angle = j * angleStep + angleStep / 2;
        x = Math.round(r2 * Math.cos(angle));
        y = Math.round(r2 * Math.sin(angle));
      }
      const m = items[i];
      nodes.push({
        id: m.id,
        x: x + offsetX,
        y: y + offsetY,
        shape: 'circularImage',
        image: this.getImageUrl(m),
        size: 1,
        borderWidth: 1,
        color: {
          border: 'rgba(255,255,255,0.85)',
          background: 'transparent',
          highlight: { border: '#ffffff', background: 'transparent' }
        },
        physics: false,
        fixed: true
      });
    }
    const data = { nodes: new DataSet(nodes), edges: new DataSet(edges) };
    this.nodesDS = data.nodes;
    const options: any = {
      physics: { enabled: false },
      interaction: { dragNodes: false, dragView: false, zoomView: false },
      layout: { improvedLayout: false }
    };
    if (!this.overlayNetwork) {
      this.overlayNetwork = new Network(container, data, options);
      this.overlayNetwork.on('click', params => {
        if (params.nodes && params.nodes.length) {
          const id = params.nodes[0];
          this.overlayNavigate(id as string);
        } else {
          this.closeOverlay();
        }
      });
      this.overlayNetwork.moveTo({ position: { x: 0, y: 0 }, scale: 1 });
      this.popIn(items.reduce((acc, m) => ({ ...acc, [m.id]: 20 }), {}), 240, 8);
    } else {
      this.overlayNetwork.setOptions(options);
      this.overlayNetwork.setData(data);
      this.overlayNetwork.moveTo({ position: { x: 0, y: 0 }, scale: 1 });
      this.popIn(items.reduce((acc, m) => ({ ...acc, [m.id]: 20 }), {}), 240, 8);
    }
  }
  private popIn(finalSizes: Record<string, number>, duration: number, steps: number) {
    if (!this.nodesDS) return;
    const ids = Object.keys(finalSizes);
    const updatesStart = ids.map(id => ({ id, size: 1 }));
    this.nodesDS.update(updatesStart);
    const stepDelay = Math.max(16, Math.round(duration / steps));
    let step = 0;
    const tick = () => {
      step++;
      const t = step / steps;
      const updates = ids.map(id => ({ id, size: Math.round(finalSizes[id] * t) }));
      this.nodesDS!.update(updates);
      if (step < steps) {
        setTimeout(tick, stepDelay);
      }
    };
    setTimeout(tick, stepDelay);
  }
  private popOut(ids: string[], duration: number, steps: number, after?: () => void) {
    if (!this.nodesDS || !ids.length) {
      after?.();
      return;
    }
    const startNodes = ids
      .map(id => this.nodesDS!.get(id))
      .filter(Boolean) as Array<{ id: string; size?: number }>;
    const starts = startNodes.reduce<Record<string, number>>((acc, n) => {
      acc[n.id] = n.size ?? 20;
      return acc;
    }, {});
    const stepDelay = Math.max(16, Math.round(duration / steps));
    let step = 0;
    const tick = () => {
      step++;
      const t = step / steps;
      const updates = Object.keys(starts).map(id => ({
        id,
        size: Math.max(1, Math.round(starts[id] * (1 - t)))
      }));
      this.nodesDS!.update(updates);
      if (step < steps) {
        setTimeout(tick, stepDelay);
      } else {
        after?.();
      }
    };
    setTimeout(tick, stepDelay);
  }
  private destroyOverlay() {
    if (this.overlayNetwork) {
      this.overlayNetwork.destroy();
      this.overlayNetwork = undefined;
    }
    this.nodesDS = undefined;
  }
}

function groupByDate(items: Memory[]) {
  const map = new Map<string, Memory[]>();
  items.forEach(m => {
    const d = m.date.slice(0, 10);
    map.set(d, [...(map.get(d) || []), m]);
  });
  return map;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push({ key: '', num: '', inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${pad(month + 1)}-${pad(d)}`;
    cells.push({ key, num: `${d}`, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ key: '', num: '', inMonth: false });
  }
  return cells;
}
