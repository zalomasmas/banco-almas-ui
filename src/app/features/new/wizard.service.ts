import { Injectable } from '@angular/core';
import { MediaItem } from '../../core/models/media-item';

@Injectable({ providedIn: 'root' })
export class WizardService {
  nodeId: string | null = null;
  isPublic: boolean = false;
  date: string = new Date().toISOString();
  title: string = '';
  text: string = '';
  attachments: MediaItem[] = [];

  reset() {
    this.nodeId = null;
    this.isPublic = false;
    this.date = new Date().toISOString();
    this.title = '';
    this.text = '';
    this.attachments = [];
  }
}
