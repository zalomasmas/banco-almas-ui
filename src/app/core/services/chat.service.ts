import { Injectable } from '@angular/core';
import { ChatMessage, ChatThread } from '../models/chat';
import { MemoryService } from './memory.service';

const THREAD_KEY = 'ba_chat_thread';

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
export class ChatService {
  constructor(private memories: MemoryService) {}

  getThread(): ChatThread {
    const raw = localStorage.getItem(THREAD_KEY);
    if (raw) return JSON.parse(raw);
    const base: ChatThread = { id: 'main', messages: [] };
    localStorage.setItem(THREAD_KEY, JSON.stringify(base));
    return base;
  }

  addUserMessage(text: string) {
    const thread = this.getThread();
    const msg: ChatMessage = { id: randomId(), role: 'user', text, timestamp: new Date().toISOString() };
    thread.messages.push(msg);
    const reply: ChatMessage = { id: randomId(), role: 'bot', text: this.replyText(text), timestamp: new Date().toISOString() };
    thread.messages.push(reply);
    localStorage.setItem(THREAD_KEY, JSON.stringify(thread));
    return { msg, reply };
  }

  saveConversationAsMemory(title: string) {
    const thread = this.getThread();
    const transcript = thread.messages.map(m => `${m.role === 'user' ? 'Tú' : 'Bot'}: ${m.text}`).join('\n');
    return this.memories.create({
      title,
      text: transcript,
      nodeId: 'otros',
      date: new Date().toISOString(),
      isPublic: false,
      attachments: []
    });
  }

  private replyText(input: string) {
    if (input.toLowerCase().includes('hola')) return 'Hola, ¿en qué puedo ayudarte?';
    return 'Entiendo. ¿Querés guardar esto como recuerdo?';
  }
}
