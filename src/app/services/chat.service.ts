import { Injectable } from '@angular/core';
import { Message } from '../models/message.model';
import { MatchService } from './match.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly MESSAGES_KEY = 'heartsync_messages';

  constructor(private matchService: MatchService) {}

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getAllMessages(): Message[] {
    const data = localStorage.getItem(this.MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveMessages(messages: Message[]): void {
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
  }

  getMessages(matchId: string): Message[] {
    return this.getAllMessages()
      .filter(m => m.matchId === matchId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  sendMessage(matchId: string, senderId: string, content: string): Message {
    const message: Message = {
      id: this.generateId(),
      matchId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    const messages = this.getAllMessages();
    messages.push(message);
    this.saveMessages(messages);
    this.matchService.updateMatchLastMessage(matchId, content);
    return message;
  }

  markAsRead(matchId: string, userId: string): void {
    const messages = this.getAllMessages();
    let changed = false;
    messages.forEach(m => {
      if (m.matchId === matchId && m.senderId !== userId && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) {
      this.saveMessages(messages);
    }
  }

  getUnreadCount(userId: string): number {
    const messages = this.getAllMessages();
    return messages.filter(m => m.senderId !== userId && !m.read).length;
  }
}
