import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  input = '';
  constructor(public svc: ChatService) {}
  send() {
    const t = this.input.trim();
    if (!t) return;
    this.svc.addUserMessage(t);
    this.input = '';
  }
  save() {
    this.svc.saveConversationAsMemory('Conversación de chat');
    alert('Conversación guardada como recuerdo');
  }
}
