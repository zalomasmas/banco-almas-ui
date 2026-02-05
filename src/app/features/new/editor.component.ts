import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WizardService } from './wizard.service';

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
  selector: 'app-new-editor',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class NewEditorComponent {
  constructor(public wiz: WizardService) {}
  isRecording = false;
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  selectedAttachmentId: string | null = null;
  titleActive = false;
  textActive = false;
  get currentAttachment() {
    const arr = this.wiz.attachments;
    if (!arr.length) return null;
    const byId = arr.find(a => a.id === this.selectedAttachmentId);
    return byId || arr[arr.length - 1];
  }
  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;
  @ViewChild('textInput') textInput?: ElementRef<HTMLTextAreaElement>;
  openTitleEditor() {
    this.titleActive = true;
    setTimeout(() => this.titleInput?.nativeElement?.focus(), 0);
  }
  closeTitleEditor() {
    this.titleActive = false;
  }
  openTextEditor() {
    this.textActive = true;
    setTimeout(() => this.textInput?.nativeElement?.focus(), 0);
  }
  closeTextEditor() {
    this.textActive = false;
  }

  onImages(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      const id = randomId();
      this.wiz.attachments.push({ id, type: 'image', url, name: f.name });
      this.selectedAttachmentId = id;
    });
    input.value = '';
  }

  onVideos(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      const id = randomId();
      this.wiz.attachments.push({ id, type: 'video', url, name: f.name });
      this.selectedAttachmentId = id;
    });
    input.value = '';
  }

  onAudioFiles(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      const id = randomId();
      this.wiz.attachments.push({ id, type: 'audio', url, name: f.name });
      this.selectedAttachmentId = id;
    });
    input.value = '';
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
      return;
    }
    await this.startRecording();
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.chunks = [];
      this.recorder = new MediaRecorder(stream);
      this.recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) this.chunks.push(e.data);
      };
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const id = randomId();
        this.wiz.attachments.push({ id, type: 'audio', url, name: 'audio.webm' });
        this.selectedAttachmentId = id;
        this.isRecording = false;
        stream.getTracks().forEach(t => t.stop());
      };
      this.recorder.start();
      this.isRecording = true;
    } catch {
      alert('No se pudo acceder al micrófono');
    }
  }

  stopRecording() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop();
    }
  }
}
