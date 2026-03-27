import { Injectable } from '@angular/core';
import { Match } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly LIKES_KEY = 'heartsync_likes';
  private readonly DISLIKES_KEY = 'heartsync_dislikes';
  private readonly MATCHES_KEY = 'heartsync_matches';

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getLikes(): { [userId: string]: string[] } {
    const data = localStorage.getItem(this.LIKES_KEY);
    return data ? JSON.parse(data) : {};
  }

  private getDislikes(): { [userId: string]: string[] } {
    const data = localStorage.getItem(this.DISLIKES_KEY);
    return data ? JSON.parse(data) : {};
  }

  getMatches(): Match[] {
    const data = localStorage.getItem(this.MATCHES_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveMatches(matches: Match[]): void {
    localStorage.setItem(this.MATCHES_KEY, JSON.stringify(matches));
  }

  like(userId: string, targetId: string): { isMatch: boolean; match?: Match } {
    const likes = this.getLikes();
    if (!likes[userId]) { likes[userId] = []; }
    if (!likes[userId].includes(targetId)) {
      likes[userId].push(targetId);
      localStorage.setItem(this.LIKES_KEY, JSON.stringify(likes));
    }

    // Check if target already liked userId
    const targetLikes = likes[targetId] || [];
    if (targetLikes.includes(userId)) {
      // It's a match!
      const matches = this.getMatches();
      const existing = matches.find(m =>
        (m.userId1 === userId && m.userId2 === targetId) ||
        (m.userId1 === targetId && m.userId2 === userId)
      );
      if (!existing) {
        const newMatch: Match = {
          id: this.generateId(),
          userId1: userId,
          userId2: targetId,
          createdAt: new Date().toISOString()
        };
        matches.push(newMatch);
        this.saveMatches(matches);
        return { isMatch: true, match: newMatch };
      }
      return { isMatch: true };
    }

    return { isMatch: false };
  }

  dislike(userId: string, targetId: string): void {
    const dislikes = this.getDislikes();
    if (!dislikes[userId]) { dislikes[userId] = []; }
    if (!dislikes[userId].includes(targetId)) {
      dislikes[userId].push(targetId);
      localStorage.setItem(this.DISLIKES_KEY, JSON.stringify(dislikes));
    }
  }

  getSeenIds(userId: string): string[] {
    const likes = this.getLikes();
    const dislikes = this.getDislikes();
    const liked = likes[userId] || [];
    const disliked = dislikes[userId] || [];
    return [...liked, ...disliked];
  }

  getUserMatches(userId: string): Match[] {
    return this.getMatches().filter(m => m.userId1 === userId || m.userId2 === userId);
  }

  getMatchById(matchId: string): Match | null {
    return this.getMatches().find(m => m.id === matchId) || null;
  }

  getOtherUserId(match: Match, currentUserId: string): string {
    return match.userId1 === currentUserId ? match.userId2 : match.userId1;
  }

  updateMatchLastMessage(matchId: string, message: string): void {
    const matches = this.getMatches();
    const idx = matches.findIndex(m => m.id === matchId);
    if (idx !== -1) {
      matches[idx].lastMessage = message;
      matches[idx].lastMessageTime = new Date().toISOString();
      this.saveMatches(matches);
    }
  }
}
