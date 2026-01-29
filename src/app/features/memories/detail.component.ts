import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MemoryService } from '../../core/services/memory.service';
import { Memory } from '../../core/models/memory';
import { MemoriesUiStateService } from './ui-state.service';

@Component({
  selector: 'app-memory-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class MemoryDetailComponent {
  memory = signal<Memory | null>(null);
  constructor(route: ActivatedRoute, memService: MemoryService, private ui: MemoriesUiStateService) {
    const id = route.snapshot.paramMap.get('id')!;
    this.memory.set(memService.get(id));
  }
  getImageUrl(m: Memory | null) {
    if (!m) return 'https://object.pixocial.com/pixocial/dmxffni837f1xrj8pki9xgrl.jpg';
    const img = m.attachments.find(a => a.type === 'image' && a.url && a.url.trim().length);
    return img?.url || 'https://object.pixocial.com/pixocial/dmxffni837f1xrj8pki9xgrl.jpg';
  }
  getBackLink() {
    return this.ui.backLink();
  }
}
