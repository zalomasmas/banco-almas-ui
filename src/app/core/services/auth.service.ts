import { Injectable, signal } from '@angular/core';
import { User } from '../models/user';

const USER_KEY = 'ba_user';

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
export class AuthService {
  userSignal = signal<User | null>(null);

  constructor() {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      this.userSignal.set(JSON.parse(raw));
    }
  }

  isLoggedIn() {
    return !!this.userSignal();
  }

  getUser() {
    return this.userSignal();
  }

  login(email: string, password: string) {
    const user: User = {
      id: randomId(),
      name: email.split('@')[0],
      email,
      onboardingCompleted: false
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
    return user;
  }

  register(name: string, email: string, password: string) {
    const user: User = {
      id: randomId(),
      name,
      email,
      onboardingCompleted: false
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
    return user;
  }

  logout() {
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
  }

  setOnboardingCompleted(value: boolean) {
    const u = this.userSignal();
    if (!u) return;
    const updated = { ...u, onboardingCompleted: value };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this.userSignal.set(updated);
  }

  getOnboardingCompleted() {
    const u = this.userSignal();
    return !!u?.onboardingCompleted;
  }
}
