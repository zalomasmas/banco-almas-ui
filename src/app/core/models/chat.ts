export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  messages: ChatMessage[];
}
