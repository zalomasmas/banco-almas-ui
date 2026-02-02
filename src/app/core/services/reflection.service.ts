import { Injectable } from '@angular/core';
import { ReflectionAnswer, ReflectionQuestion } from '../models/reflection';

const QUESTIONS_KEY = 'ba_questions';
const ANSWERS_KEY = 'ba_answers';

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
      id: randomId(),
      questionId,
      text,
      date: new Date().toISOString()
    };
    list.unshift(answer);
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(list));
    return answer;
  }
}
