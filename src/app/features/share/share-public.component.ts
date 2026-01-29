import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShareService } from '../../core/services/share.service';
import { MemoryService } from '../../core/services/memory.service';
import { Memory } from '../../core/models/memory';

@Component({
  selector: 'app-share-public',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './share-public.component.html',
  styleUrl: './share-public.component.scss'
})
export class SharePublicComponent {
  items = signal<Memory[]>([]);
  constructor(route: ActivatedRoute, share: ShareService, mems: MemoryService) {
    const token = route.snapshot.paramMap.get('token')!;
    const link = share.getByToken(token);
    const list = mems.list();
    const result = (link?.items || []).map(it => list.find(m => m.id === it.memoryId)).filter(Boolean) as Memory[];
    this.items.set(result);
  }
}
