import { Injectable } from '@angular/core';
import { ReflectionAnswer, ReflectionQuestion } from '../models/reflection';

const QUESTIONS_KEY = 'ba_questions';
const ANSWERS_KEY = 'ba_answers';

@Injectable({ providedIn: 'root' })
export class ReflectionService {
  getQuestions(): ReflectionQuestion[] {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (raw) return JSON.parse(raw);
    const base: ReflectionQuestion[] = [
      { id: 'q1', text: '¿Qué te hizo sonreír hoy?' },
      { id: 'q2', text: '¿Qué recuerdo te da paz?' },
      { id: 'q3', text: '¿Quién te inspira y por qué?' },
      { id: 'q4', text: '¿Qué aprende tu alma esta semana?' },
      { id: 'q5', text: 'Describe un momento de gratitud.' }
    ];
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(base));
    return base;
  }

  getAnswers(): ReflectionAnswer[] {
    const raw = localStorage.getItem(ANSWERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  saveAnswer(questionId: string, text: string) {
    const list = this.getAnswers();
    const answer: ReflectionAnswer = {
      id: crypto.randomUUID(),
      questionId,
      text,
      date: new Date().toISOString()
    };
    list.unshift(answer);
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(list));
    return answer;
  }
}
