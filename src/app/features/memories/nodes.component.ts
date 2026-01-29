import { Component, computed, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MemoryService } from '../../core/services/memory.service';
import { MemoryNode } from '../../core/models/memory-node';
import { Memory } from '../../core/models/memory';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { MemoriesUiStateService } from './ui-state.service';

@Component({
  selector: 'app-memories-nodes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nodes.component.html',
  styleUrl: './nodes.component.scss'
})
export class MemoriesNodesComponent implements AfterViewInit {
  amigos = signal<Memory[]>([]);
  familia = signal<Memory[]>([]);
  mascota = signal<Memory[]>([]);
  otros = signal<Memory[]>([]);
  showMenu = signal<boolean>(false);
  expanded = signal<{ amigos: boolean; familia: boolean; mascota: boolean; otros: boolean }>({
    amigos: false,
    familia: false,
    mascota: false,
    otros: false
  });
  anyExpanded = computed(() => {
    const e = this.expanded();
    return e.amigos || e.familia || e.mascota || e.otros;
  });
  @ViewChild('network') networkEl?: ElementRef<HTMLDivElement>;
  private network?: Network;
  private resetOnNextRender = false;
  private nodesDS?: DataSet<any>;
  private edgesDS?: DataSet<any>;
  private justOpenedMenu = false;
  private lastToggledGroup: ('amigos' | 'familia' | 'mascota' | 'otros') | null = null;
  private childIdsByGroup: Record<'amigos' | 'familia' | 'mascota' | 'otros', string[]> = {
    amigos: [],
    familia: [],
    mascota: [],
    otros: []
  };

  constructor(private memService: MemoryService, private router: Router, private ui: MemoriesUiStateService) {
    this.amigos.set(this.memService.filterByNode('amigos'));
    this.familia.set(this.memService.filterByNode('familia'));
    this.mascota.set(this.memService.filterByNode('mascota'));
    this.otros.set(this.memService.filterByNode('otros'));
    this.ui.setView('nodos');
    this.showMenu.set(this.ui.nodes.showMenu);
    this.expanded.set({ ...this.ui.nodes.expanded });
  }
  ngAfterViewInit() {
    this.renderNetwork();
  }

  getImageUrl(m: Memory) {
    const img = m.attachments.find(a => a.type === 'image' && a.url && a.url.trim().length);
    return img?.url || 'https://object.pixocial.com/pixocial/dmxffni837f1xrj8pki9xgrl.jpg';
  }

  private countFor(node: 'amigos' | 'familia' | 'mascota' | 'otros') {
    switch (node) {
      case 'amigos': return this.amigos().length;
      case 'familia': return this.familia().length;
      case 'mascota': return this.mascota().length;
      case 'otros': return this.otros().length;
    }
  }
  thumbSize(node: 'amigos' | 'familia' | 'mascota' | 'otros') {
    const n = this.countFor(node);
    if (n > 20) return 32;
    if (n > 12) return 36;
    if (n > 6) return 40;
    return 44;
  }

  styleFor(node: 'amigos' | 'familia' | 'mascota' | 'otros', idx: number) {
    const ORBIT_W = 320;
    const ORBIT_H = 320;
    const ICON_R = 22;
    const THUMB_R = Math.round(this.thumbSize(node) / 2);
    const OFFSET = 72;
    const MIN_ICON_DIST = ICON_R + THUMB_R + 6;
    const CLOUD_CENTER = { x: ORBIT_W / 2, y: ORBIT_H / 2 };
    const MIN_CLOUD_DIST = 60;
    const R_BASE = MIN_ICON_DIST + 4;
    const R_STEP = THUMB_R + 2 + 4;
    const MARGIN = 2;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const norm = (a: number) => {
      while (a <= -Math.PI) a += Math.PI * 2;
      while (a > Math.PI) a -= Math.PI * 2;
      return a;
    };
    const diff = (a: number, b: number) => norm(b - a);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const rayToSegmentIntersection = (
      Bx: number,
      By: number,
      angle: number,
      Ax: number,
      Ay: number,
      Cx: number,
      Cy: number
    ) => {
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const sx = Cx - Ax;
      const sy = Cy - Ay;
      const det = dy * sx - dx * sy;
      if (Math.abs(det) < 1e-6) return Infinity;
      const t = ((Ay - By) * sx - (Ax - Bx) * sy) / det;
      const u = (dx * (Ay - By) - dy * (Ax - Bx)) / det;
      if (t > 0 && u >= 0 && u <= 1) return t;
      return Infinity;
    };
    const dist = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x1 - x2, y1 - y2);

    const centers: Record<typeof node, { cx: number; cy: number }> = {
      amigos: { cx: ORBIT_W / 2, cy: OFFSET + ICON_R },
      familia: { cx: ORBIT_W - OFFSET - ICON_R, cy: ORBIT_H / 2 },
      mascota: { cx: OFFSET + ICON_R, cy: ORBIT_H / 2 },
      otros: { cx: ORBIT_W / 2, cy: ORBIT_H - OFFSET - ICON_R }
    };

    const vertexTriples: Record<typeof node, [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }]> = {
      amigos: [{ x: 0, y: 0 }, { x: centers.amigos.cx, y: centers.amigos.cy }, { x: ORBIT_W, y: 0 }],
      familia: [{ x: ORBIT_W, y: 0 }, { x: centers.familia.cx, y: centers.familia.cy }, { x: ORBIT_W, y: ORBIT_H }],
      mascota: [{ x: 0, y: 0 }, { x: centers.mascota.cx, y: centers.mascota.cy }, { x: 0, y: ORBIT_H }],
      otros: [{ x: 0, y: ORBIT_H }, { x: centers.otros.cx, y: centers.otros.cy }, { x: ORBIT_W, y: ORBIT_H }]
    };

    const [A, B, C] = vertexTriples[node];
    const angleA = Math.atan2(A.y - B.y, A.x - B.x);
    const angleC = Math.atan2(C.y - B.y, C.x - B.x);
    const delta = diff(angleA, angleC);
    const start = angleA;
    const end = angleA + delta;

    const sepDist = THUMB_R * 2 + MARGIN;
    const positions: Array<{ x: number; y: number }> = [];

    for (let j = 0; j <= idx; j++) {
      const ringData = (() => {
        let r = 0;
        let remaining = j + 1;
        while (true) {
          const radius = R_BASE + r * R_STEP;
          const arcLength = Math.abs(end - start) * radius;
          let points = Math.max(1, Math.floor(arcLength / sepDist));
          points = Math.min(12, points);
          if (remaining > points) {
            remaining -= points;
            r++;
            continue;
          }
          return { r, points, k: remaining - 1, radius };
        }
      })();
      const tAngle = (ringData.k + 1) / (ringData.points + 1);
      let baseAngle = start + tAngle * (end - start);
      const jitterAngles = [0, 2, -2, 4, -4, 6, -6, 8, -8, 10, -10, 12, -12, 14, -14, 16, -16].map(d => (d * Math.PI) / 180);
      const radialSteps = [0, 2, 4, 6, 8, 10, 12, 14, 16];
      let placedX = 0;
      let placedY = 0;
      let placed = false;
      for (const jAng of jitterAngles) {
        const a2 = baseAngle + jAng;
        const tMax = rayToSegmentIntersection(B.x, B.y, a2, A.x, A.y, C.x, C.y);
        const rCap = (tMax === Infinity ? R_BASE + ringData.r * R_STEP + 60 : tMax) - THUMB_R - MARGIN;
        for (const dr of radialSteps) {
          const r2 = Math.min(ringData.radius + dr, rCap);
          const x2 = B.x + r2 * Math.cos(a2);
          const y2 = B.y + r2 * Math.sin(a2);
          const { cx, cy } = centers[node];
          if (Math.hypot(x2 - cx, y2 - cy) < MIN_ICON_DIST) continue;
          if (Math.hypot(x2 - CLOUD_CENTER.x, y2 - CLOUD_CENTER.y) < MIN_CLOUD_DIST) continue;
          let collide = false;
          for (let s = 0; s < positions.length; s++) {
            const q2 = positions[s];
            if (Math.hypot(x2 - q2.x, y2 - q2.y) < sepDist) {
              collide = true;
              break;
            }
          }
          if (!collide) {
            placedX = clamp(x2, THUMB_R + MARGIN, ORBIT_W - THUMB_R - MARGIN);
            placedY = clamp(y2, THUMB_R + MARGIN, ORBIT_H - THUMB_R - MARGIN);
            baseAngle = a2;
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (!placed) {
        const tMax = rayToSegmentIntersection(B.x, B.y, baseAngle, A.x, A.y, C.x, C.y);
        const rCap = (tMax === Infinity ? R_BASE + ringData.r * R_STEP + 60 : tMax) - THUMB_R - MARGIN;
        const xF = B.x + Math.min(ringData.radius, rCap) * Math.cos(baseAngle);
        const yF = B.y + Math.min(ringData.radius, rCap) * Math.sin(baseAngle);
        placedX = clamp(xF, THUMB_R + MARGIN, ORBIT_W - THUMB_R - MARGIN);
        placedY = clamp(yF, THUMB_R + MARGIN, ORBIT_H - THUMB_R - MARGIN);
      }
      positions.push({ x: placedX, y: placedY });
    }

    const final = positions[idx];
    return { top: Math.round(final.y - THUMB_R), left: Math.round(final.x - THUMB_R) };
  }

  toggleOptions() {
    const next = !this.showMenu();
    if (next) {
      this.showMenu.set(true);
      this.resetOnNextRender = true;
      this.justOpenedMenu = true;
      this.ui.setNodes({ showMenu: this.showMenu(), expanded: this.expanded() });
      setTimeout(() => this.renderNetwork(), 0);
    } else {
      const e = this.expanded();
      const idsToShrink: string[] = ['amigos', 'familia', 'mascota', 'otros'];
      if (e.amigos) idsToShrink.push(...this.childIdsByGroup.amigos);
      if (e.familia) idsToShrink.push(...this.childIdsByGroup.familia);
      if (e.mascota) idsToShrink.push(...this.childIdsByGroup.mascota);
      if (e.otros) idsToShrink.push(...this.childIdsByGroup.otros);
      this.popOut(idsToShrink, 220, 8, () => {
        this.expanded.set({ amigos: false, familia: false, mascota: false, otros: false });
        this.showMenu.set(false);
        this.ui.setNodes({ showMenu: this.showMenu(), expanded: this.expanded() });
        setTimeout(() => this.renderNetwork(), 0);
      });
    }
  }
  select(id: 'amigos' | 'familia' | 'mascota' | 'otros') {
    const cur = this.expanded();
    const wasOpen = cur[id];
    if (wasOpen) {
      const ids = this.childIdsByGroup[id] || [];
      this.popOut(ids, 240, 10, () => {
        const next = { ...this.expanded(), [id]: false };
        this.expanded.set(next);
        this.ui.setNodes({ showMenu: this.showMenu(), expanded: this.expanded() });
        setTimeout(() => this.renderNetwork(), 0);
      });
    } else {
      this.expanded.set({ ...cur, [id]: true });
      this.lastToggledGroup = id;
      this.ui.setNodes({ showMenu: this.showMenu(), expanded: this.expanded() });
      setTimeout(() => this.renderNetwork(), 0);
    }
  }

  private renderNetwork() {
    const container = this.networkEl?.nativeElement;
    if (!container) {
      setTimeout(() => this.renderNetwork(), 0);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const cloudEl = container.parentElement?.querySelector('.center-cloud') as HTMLElement | null;
    const cloudRect = cloudEl?.getBoundingClientRect();
    const containerCenter = { x: containerRect.left + containerRect.width / 2, y: containerRect.top + containerRect.height / 2 };
    const cloudCenter = cloudRect ? { x: cloudRect.left + cloudRect.width / 2, y: cloudRect.top + cloudRect.height / 2 } : containerCenter;
    const offsetX = cloudCenter.x - containerCenter.x;
    const offsetY = cloudCenter.y - containerCenter.y;
    const ORBIT_W = 320;
    const ORBIT_H = 320;
    const nodes: Array<any> = [];
    const edges: Array<any> = [];
    // category nodes
    const ICON_R = 22;
    const OFFSET = 72;
    const centers = {
      amigos: { cx: ORBIT_W / 2, cy: OFFSET + ICON_R },
      familia: { cx: ORBIT_W - OFFSET - ICON_R, cy: ORBIT_H / 2 },
      mascota: { cx: OFFSET + ICON_R, cy: ORBIT_H / 2 },
      otros: { cx: ORBIT_W / 2, cy: ORBIT_H - OFFSET - ICON_R }
    } as const;
    const menuVisible = this.showMenu();
    const categoryIds: string[] = [];
    (Object.keys(centers) as Array<'amigos' | 'familia' | 'mascota' | 'otros'>).forEach(key => {
      const { cx, cy } = centers[key];
      categoryIds.push(key);
      nodes.push({
        id: key,
        x: cx - ORBIT_W / 2 + offsetX,
        y: cy - ORBIT_H / 2 + offsetY,
        shape: 'image',
        image: this.getCategoryIcon(key),
        size: menuVisible ? (this.justOpenedMenu ? 1 : 20) : 1,
        physics: false,
        fixed: true,
        hidden: !menuVisible
      });
    });
    const pushGroup = (group: 'amigos' | 'familia' | 'mascota' | 'otros', list: Memory[]) => {
      if (!list.length) return;
      const size = Math.round(this.thumbSize(group) / 2);
      childIdsByGroup[group] = [];
      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        const pos = this.styleFor(group, i);
        const cx = pos.left + size;
        const cy = pos.top + size;
        childIdsByGroup[group].push(m.id);
        nodes.push({
          id: m.id,
          x: cx - ORBIT_W / 2 + offsetX,
          y: cy - ORBIT_H / 2 + offsetY,
          label: '',
          shape: 'circularImage',
          image: this.getImageUrl(m),
          size: this.lastToggledGroup === group ? 1 : size,
          borderWidth: 1,
          color: {
            border: 'rgba(255,255,255,0.25)',
            background: 'transparent',
            highlight: { border: '#ffffff', background: 'transparent' }
          },
          physics: false,
          fixed: true
        });
      }
    };
    const e = this.expanded();
    const childIdsByGroup: Record<'amigos' | 'familia' | 'mascota' | 'otros', string[]> = {
      amigos: [],
      familia: [],
      mascota: [],
      otros: []
    };
    if (e.amigos) pushGroup('amigos', this.amigos());
    if (e.familia) pushGroup('familia', this.familia());
    if (e.mascota) pushGroup('mascota', this.mascota());
    if (e.otros) pushGroup('otros', this.otros());
    this.childIdsByGroup = childIdsByGroup;

    const data = { nodes: new DataSet(nodes), edges: new DataSet(edges) };
    this.nodesDS = data.nodes;
    this.edgesDS = data.edges;
    const options: any = {
      physics: { enabled: false },
      interaction: { dragNodes: false, dragView: true, zoomView: true },
      layout: { improvedLayout: false }
    };
    const prevScale = this.network?.getScale?.() ?? 1;
    const prevPos = this.network?.getViewPosition?.() ?? { x: 0, y: 0 };
    const targetScale = this.resetOnNextRender ? 1 : prevScale;
    const targetPos = this.resetOnNextRender ? { x: 0, y: 0 } : prevPos;
    if (!this.network) {
      this.network = new Network(container, data, options);
      this.network.on('click', params => {
        if (params.nodes && params.nodes.length) {
          const id = params.nodes[0];
          if (id === 'amigos' || id === 'familia' || id === 'mascota' || id === 'otros') {
            this.select(id as any);
            return;
          }
          this.ui.setView('nodos');
          this.router.navigate(['/app/recuerdos', id as string]);
        }
      });
    } else {
      this.network.setOptions(options);
      this.network.setData(data);
    }
    this.network.moveTo({ position: targetPos, scale: targetScale });
    this.resetOnNextRender = false;
    if (menuVisible && this.justOpenedMenu) {
      this.popIn(categoryIds.reduce((acc, id) => ({ ...acc, [id]: 20 }), {}), 240, 8);
      this.justOpenedMenu = false;
    }
    if (this.lastToggledGroup && e[this.lastToggledGroup]) {
      const group = this.lastToggledGroup;
      const finalSizes: Record<string, number> = {};
      const size = Math.round(this.thumbSize(group) / 2);
      for (const id of childIdsByGroup[group]) finalSizes[id] = size;
      this.popIn(finalSizes, 280, 10);
      this.lastToggledGroup = null;
    }
  }
  private getCategoryIcon(kind: 'amigos' | 'familia' | 'mascota' | 'otros') {
    const circle = `<circle cx="22" cy="22" r="22" fill="#BF4158"/>`;
    const amigos = `<circle cx="16" cy="18" r="5" fill="#fff"/><circle cx="28" cy="18" r="5" fill="#fff"/><rect x="11" y="26" width="22" height="6" fill="#fff"/>`;
    const familia = `<polygon points="22,8 8,20 36,20" fill="#fff"/><rect x="12" y="20" width="20" height="14" fill="#fff"/>`;
    const mascota = `<circle cx="22" cy="26" r="8" fill="#fff"/><circle cx="12" cy="18" r="3" fill="#fff"/><circle cx="32" cy="18" r="3" fill="#fff"/><circle cx="17" cy="14" r="3" fill="#fff"/><circle cx="27" cy="14" r="3" fill="#fff"/>`;
    const otros = `<rect x="20" y="10" width="4" height="24" fill="#fff"/><rect x="10" y="20" width="24" height="4" fill="#fff"/>`;
    const body = kind === 'amigos' ? amigos : kind === 'familia' ? familia : kind === 'mascota' ? mascota : otros;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44">${circle}${body}</svg>`;
    const encoded = encodeURIComponent(svg);
    return `data:image/svg+xml;charset=UTF-8,${encoded}`;
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
  private destroyNetwork() {
    if (this.network) {
      this.network.destroy();
      this.network = undefined;
    }
  }
}
