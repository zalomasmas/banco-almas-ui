import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReflectionService } from '../../core/services/reflection.service';
import { MemoryService } from '../../core/services/memory.service';

@Component({
  selector: 'app-reflection-respond',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './respond.component.html',
  styleUrl: './respond.component.scss'
})
export class ReflectionRespondComponent {
  text = '';
  questionId = '';
  constructor(private route: ActivatedRoute, private service: ReflectionService, private memories: MemoryService) {
    this.questionId = this.route.snapshot.paramMap.get('questionId')!;
  }
  save() {
    this.service.saveAnswer(this.questionId, this.text);
    this.text = '';
    alert('Respuesta guardada');
  }
  saveAsMemory() {
    this.memories.create({
      title: 'Reflexión',
      text: this.text,
      nodeId: 'otros',
      date: new Date().toISOString(),
      isPublic: false,
      attachments: []
    });
    this.text = '';
    alert('Guardado como recuerdo');
  }
}
