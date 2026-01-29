import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WizardService } from './wizard.service';

@Component({
  selector: 'app-new-editor',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class NewEditorComponent {
  constructor(public wiz: WizardService) {}
  isRecording = false;
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];

  onImages(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      this.wiz.attachments.push({ id: crypto.randomUUID(), type: 'image', url, name: f.name });
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
        this.wiz.attachments.push({ id: crypto.randomUUID(), type: 'audio', url, name: 'audio.webm' });
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
