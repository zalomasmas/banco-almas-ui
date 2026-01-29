import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReflectionService } from '../../core/services/reflection.service';
import { ReflectionQuestion } from '../../core/models/reflection';

@Component({
  selector: 'app-reflection-questions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss'
})
export class ReflectionQuestionsComponent {
  list = signal<ReflectionQuestion[]>([]);
  index = signal(0);
  current = signal<ReflectionQuestion | null>(null);
  constructor(private service: ReflectionService) {
    const qs = this.service.getQuestions();
    this.list.set(qs);
    this.current.set(qs[0] || null);
  }
  next() {
    const i = (this.index() + 1) % this.list().length;
    this.index.set(i);
    this.current.set(this.list()[i] || null);
  }
}
