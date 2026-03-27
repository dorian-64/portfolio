import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { TwoFactorService } from './two-factor.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USERS_KEY = 'heartsync_users';
  private readonly SESSION_KEY = 'heartsync_session';
  private readonly PENDING_2FA_KEY = 'heartsync_pending_2fa';

  constructor(private router: Router, private twoFactorService: TwoFactorService) {}

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getUsers(): User[] {
    const data = localStorage.getItem(this.USERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  register(email: string, password: string, firstName: string, lastName: string): { success: boolean; error?: string; user?: User } {
    const users = this.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Cet email est déjà utilisé.' };
    }

    const user: User = {
      id: this.generateId(),
      email: email.toLowerCase(),
      passwordHash: this.simpleHash(password),
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
      twoFactorEnabled: false,
      twoFactorSecret: this.twoFactorService.generateSecret(),
      isProfileComplete: false
    };

    users.push(user);
    this.saveUsers(users);
    return { success: true, user };
  }

  login(email: string, password: string): { success: boolean; requiresTwoFactor?: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== this.simpleHash(password)) {
      return { success: false, error: 'Email ou mot de passe incorrect.' };
    }

    if (user.twoFactorEnabled) {
      localStorage.setItem(this.PENDING_2FA_KEY, user.id);
      return { success: true, requiresTwoFactor: true, user };
    }

    this.createSession(user.id);
    return { success: true, requiresTwoFactor: false, user };
  }

  verifyTwoFactor(code: string): { success: boolean; error?: string } {
    const pendingId = localStorage.getItem(this.PENDING_2FA_KEY);
    if (!pendingId) {
      return { success: false, error: 'Session expirée.' };
    }

    const users = this.getUsers();
    const user = users.find(u => u.id === pendingId);
    if (!user) {
      return { success: false, error: 'Utilisateur introuvable.' };
    }

    if (!this.twoFactorService.verifyTOTPCode(user.twoFactorSecret, code)) {
      return { success: false, error: 'Code invalide. Veuillez réessayer.' };
    }

    localStorage.removeItem(this.PENDING_2FA_KEY);
    this.createSession(user.id);
    return { success: true };
  }

  enableTwoFactor(userId: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) { return false; }
    users[idx].twoFactorEnabled = true;
    this.saveUsers(users);
    this.updateSession(users[idx]);
    return true;
  }

  disableTwoFactor(userId: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) { return false; }
    users[idx].twoFactorEnabled = false;
    users[idx].twoFactorSecret = this.twoFactorService.generateSecret();
    this.saveUsers(users);
    this.updateSession(users[idx]);
    return true;
  }

  private createSession(userId: string): void {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    }
  }

  private updateSession(user: User): void {
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    }
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }

  refreshCurrentUser(): void {
    const current = this.getCurrentUser();
    if (current) {
      this.createSession(current.id);
    }
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  getPending2FAUserId(): string | null {
    return localStorage.getItem(this.PENDING_2FA_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.PENDING_2FA_KEY);
    this.router.navigate(['/']);
  }

  markProfileComplete(userId: string): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].isProfileComplete = true;
      this.saveUsers(users);
      this.createSession(userId);
    }
  }

  updatePassword(userId: string, newPassword: string): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].passwordHash = this.simpleHash(newPassword);
      this.saveUsers(users);
    }
  }
}
